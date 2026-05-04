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

/**
 * GET /bookings
 * Optimized with Parallel fetching of data and total count.
 */
export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { name: true } },
          listing: { select: { title: true, location: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count(),
    ]);

    res.json({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /bookings/:id
 */
export const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: { user: true, listing: true },
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/:id/bookings
 */
export const getUserBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = Number(req.params.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where: { guestId: userId },
        skip: (page - 1) * limit,
        take: limit,
        include: { listing: { select: { title: true } } },
      }),
      prisma.booking.count({ where: { guestId: userId } }),
    ]);

    res.json({ data, meta: { total, page, limit } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /bookings
 * Logic: Validates entities, calculates price server-side, and creates record.
 */
export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, listingId, checkIn, checkOut, guests } = req.body;

    // 1. Validation
    if (!userId || !listingId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 2. Verify User and Listing exist
    const [user, listing] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.listing.findUnique({ where: { id: listingId } }),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // 3. Price Calculation
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const total = nights * listing.pricePerNight;

    // 4. Create
    const booking = await prisma.booking.create({
      data: {
        guestId: userId,
        listingId,
        checkIn: start,
        checkOut: end,
        guests,
        totalPrice: total,
        status: 'PENDING',
      },
    });

    res.status(201).json(booking);
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

/**
 * DELETE /bookings/:id
 */
export const deleteBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const exists = await prisma.booking.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: 'Booking not found' });

    await prisma.booking.delete({ where: { id } });
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    next(error);
  }
};
