// =============================================================
// FILE: src/controllers/bookings.controller.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Business logic for Bookings.
//   Manages the lifecycle of a reservation, including
//   server-side price calculation and existence validation.
// =============================================================

import type { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { Prisma } from '../generated/prisma/client.js';
import { createBookingSchema } from "../validators/bookings.validator.js";


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
    const id = parseInt(req.params["id"] as string);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: true, // Full guest profile
        listing: {
          include: {
            host: { select: { name: true } } // Show host name of the property
          }
        }
      }
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json(booking);
  } catch (error) {
    handleControllerError(res, error, "getBookingById");
  }
};


// ---------------------------------------------------------------
// POST /bookings
// Creates a booking. Validates dates, existence, and calculates price.
// ---------------------------------------------------------------
export const createBooking = async (req: Request, res: Response) => {
  try {
    const result = createBookingSchema.safeParse(req.body);

    if (!result.success) {
  res.status(400).json({ 
    message: "Validation failed",
    errors: result.error.flatten().fieldErrors 
  });
  return;
}


    // Extraction from result.data (includes listingId, checkIn, checkOut)
    const { listingId, checkIn, checkOut } = result.data;
    const guestId = req.body.guestId; // guestId is still needed from body

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    // Price calculation logic stays here, but dates are already valid!
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listing.pricePerNight;

    const newBooking = await prisma.booking.create({
      data: {
        listingId,
        guestId,
        checkIn: start,
        checkout: end,
        totalPrice,
      },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    handleControllerError(res, error, "createBooking");
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

// ---------------------------------------------------------------
// DELETE /bookings/:id
// Removes a booking after checking if it exists.
// ---------------------------------------------------------------
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);

    const existing = await prisma.booking.findFirst({ where: { id } });

    if (!existing) {
      res.status(404).json({ message: `Booking with id ${id} not found.` });
      return;
    }

    await prisma.booking.delete({ where: { id } });

    res.status(200).json({ message: 'Booking deleted successfully.' });
  } catch (error) {
    console.error('deleteBooking error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
