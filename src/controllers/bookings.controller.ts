// =============================================================
// FILE: src/controllers/bookings.controller.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Business logic for Bookings.
//   Manages the lifecycle of a reservation, including
//   server-side price calculation and existence validation.
// =============================================================

import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import { Prisma } from '../generated/prisma/client.js';
import { createBookingSchema } from '../validators/bookings.validator.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { sendEmail } from '../config/email.js';
import {
  bookingConfirmationEmail,
  bookingCancellationEmail,
} from '../templates/emails.js';

// Utility to handle Prisma errors consistently
export const handleControllerError = (
  res: Response,
  error: unknown,
  operation: string,
) => {
  // 1. Log the error server-side for debugging
  console.error(`❌ [${operation}] Failed:`, {
    code:
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code
        : 'N/A',
    message: error instanceof Error ? error.message : error,
  });

  // 2. Check for specific Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint (e.g., duplicate email)
        return res
          .status(409)
          .json({ message: 'A record with that unique field already exists.' });
      case 'P2025': // Record not found
        return res
          .status(404)
          .json({ message: 'The requested record was not found.' });
      case 'P2003': // Foreign key constraint (e.g., invalid hostId)
        return res.status(400).json({
          message:
            'Cannot delete this record because it is being used by other data (e.g., active bookings).',
        });
    }
  }

  // 3. Fallback for all other errors
  return res.status(500).json({ message: 'Something went wrong.' });
};

// ---------------------------------------------------------------
// GET /bookings
// Returns all bookings with guest name and listing title.
// ---------------------------------------------------------------
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        guest: { select: { name: true } },
        listing: { select: { title: true } },
      },
    });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('getAllBookings error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// ---------------------------------------------------------------
// GET /bookings/:id
// Returns detailed info for one booking, guest, and listing.
// ---------------------------------------------------------------
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: true, // Full guest profile
        listing: {
          include: {
            host: { select: { name: true } }, // Show host name of the property
          },
        },
      },
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json(booking);
  } catch (error) {
    handleControllerError(res, error, 'getBookingById');
  }
};

// POST /bookings
export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { listingId, checkIn, checkOut } = req.body;
    const guestId = req.userId!; // Derived from JWT, safe from tampering

    // 1. Basic validation
    if (!listingId || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const now = new Date();

    // 2. Date Logic Validation
    if (start >= end) {
      return res
        .status(400)
        .json({ error: 'Check-in must be before check-out' });
    }
    if (start < now) {
      return res.status(400).json({ error: 'Check-in must be in the future' });
    }

    // 3. Verify Listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const diffInDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = diffInDays * listing.pricePerNight;

    // 3. ATOMIC TRANSACTION
    // We use 'tx' (the transaction client) for all DB calls inside this block
    try {
      const booking = await prisma.$transaction(async (tx) => {
        // A. Check for conflicts inside the transaction
        const conflict = await tx.booking.findFirst({
          where: {
            listingId,
            status: 'CONFIRMED',
            checkIn: { lt: end },
            checkout: { gt: start },
          },
        });

        if (conflict) {
          // We throw a specific error string to catch it later
          throw new Error('BOOKING_CONFLICT');
        }

        // B. Create the booking if no conflict
        return await tx.booking.create({
          data: {
            listingId,
            guestId: guestId!,
            checkIn: start,
            checkout: end,
            totalPrice,
            status: 'PENDING',
          },
        });
      });

      res.status(201).json(booking);
    } catch (txError: any) {
      // 4. Handle the specific conflict error
      if (txError.message === 'BOOKING_CONFLICT') {
        return res
          .status(409)
          .json({ error: 'This listing is already booked for these dates.' });
      }
      throw txError; // Pass other DB errors to the outer catch
    }
  } catch (error) {
    next(error);
  }
};

// PATCH /bookings/:id/status
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);
    const { status } = req.body;

    // Basic validation (Prisma will also throw error if status isn't in Enum)
    if (!status) {
      res.status(400).json({ message: 'Status is required.' });
      return;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    res.status(200).json(updated);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating status. Ensure status is valid.' });
  }
};

// DELETE /bookings/:id (Cancel)
export const deleteBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params['id'] as string);

    // Find booking with relations for email data
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: { select: { name: true, email: true } },
        listing: { select: { title: true } },
      },
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.guestId !== req.userId && req.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Booking cancelled successfully' });

    // 2. Send Cancellation Email (Async/Background)
    try {
      const checkInStr = new Date(booking.checkIn).toLocaleDateString();
      const checkOutStr = new Date(booking.checkout).toLocaleDateString();

      await sendEmail(
        booking.guest.email,
        'Booking Cancelled',
        bookingCancellationEmail(
          booking.guest.name,
          booking.listing.title,
          checkInStr,
          checkOutStr,
        ),
      );
    } catch (emailErr) {
      console.error('Failed to send cancellation email:', emailErr);
    }
  } catch (error) {
    next(error);
  }
};
