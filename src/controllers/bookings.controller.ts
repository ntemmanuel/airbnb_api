// =============================================================
// FILE: src/controllers/bookings.controller.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Business logic for Bookings.
//   Manages the lifecycle of a reservation, including
//   server-side price calculation and existence validation.
// =============================================================

import type { Request, Response } from 'express';
import prisma from '../config/prisma.js';

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
        guest: true,
        listing: true,
      },
    });

    if (!booking) {
      res.status(404).json({ message: `Booking with id ${id} not found.` });
      return;
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('getBookingById error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// ---------------------------------------------------------------
// POST /bookings
// Creates a booking. Validates dates, existence, and calculates price.
// ---------------------------------------------------------------
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { guestId, listingId, checkIn, checkOut } = req.body;

    // 1. Validate required fields
    if (!guestId || !listingId || !checkIn || !checkOut) {
      res.status(400).json({ message: 'Missing required fields.' });
      return;
    }

    // 2. Verify Guest and Listing exist
    const [guest, listing] = await Promise.all([
      prisma.user.findUnique({ where: { id: guestId } }),
      prisma.listing.findUnique({ where: { id: listingId } }),
    ]);

    if (!guest) {
      res.status(404).json({ message: 'Guest not found.' });
      return;
    }
    if (!listing) {
      res.status(404).json({ message: 'Listing not found.' });
      return;
    }

    // 3. Calculate totalPrice server-side
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffInMs = end.getTime() - start.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays <= 0) {
      res.status(400).json({ message: 'Check-out must be after check-in.' });
      return;
    }

    const totalPrice = diffInDays * listing.pricePerNight;

    // 4. Create the booking
    const newBooking = await prisma.booking.create({
      data: {
        guestId,
        listingId,
        checkIn: start,
        checkout: end,
        totalPrice,
        status: 'PENDING',
      },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
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
