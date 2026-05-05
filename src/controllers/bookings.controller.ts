// =============================================================
// FILE: src/controllers/bookings.controller.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Business logic for Bookings.
//   Manages the lifecycle of a reservation, including
//   server-side price calculation and existence validation.
// =============================================================

import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import { createBookingSchema } from '../validators/bookings.validator.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { sendEmail } from '../config/email.js';
import {
  bookingConfirmationEmail,
  bookingCancellationEmail,
} from '../templates/emails.js';

// Utility to handle Prisma errors consistently
// export const handleControllerError = (
//   res: Response,
//   error: unknown,
//   operation: string,
// ) => {
//   // 1. Log the error server-side for debugging
//   console.error(`❌ [${operation}] Failed:`, {
//     code:
//       error instanceof Prisma.PrismaClientKnownRequestError
//         ? error.code
//         : 'N/A',
//     message: error instanceof Error ? error.message : error,
//   });

//   // 2. Check for specific Prisma errors
//   if (error instanceof Prisma.PrismaClientKnownRequestError) {
//     switch (error.code) {
//       case 'P2002': // Unique constraint (e.g., duplicate email)
//         return res
//           .status(409)
//           .json({ message: 'A record with that unique field already exists.' });
//       case 'P2025': // Record not found
//         return res
//           .status(404)
//           .json({ message: 'The requested record was not found.' });
//       case 'P2003': // Foreign key constraint (e.g., invalid hostId)
//         return res.status(400).json({
//           message:
//             'Cannot delete this record because it is being used by other data (e.g., active bookings).',
//         });
//     }
//   }

//   // 3. Fallback for all other errors
//   return res.status(500).json({ message: 'Something went wrong.' });
// };

const bookingInclude = {
  guest: { select: { id: true, name: true, email: true, username: true } },
  listing: {
    include: {
      photos: true,
      host: { select: { id: true, name: true, email: true } },
    },
  },
};

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
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
          guest: { select: { name: true } }, // ✅ FIXED (was user)
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
export const getBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
      },
    });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const currentUserId = req.userId;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // ✅ Authorization
    if (booking.guestId !== currentUserId) {
      return res.status(403).json({
        error: 'You are not allowed to view this booking',
      });
    }

    res.status(200).json(booking);
  } catch (error) {
    return error;
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
    const userId = req.params.id as string;
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
// export const createBooking = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const { userId, listingId, checkIn, checkOut, guests } = req.body;

//     // 1. Validation
//     if (!userId || !listingId || !checkIn || !checkOut || !guests) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // 2. Verify User and Listing exist
//     const [user, listing] = await Promise.all([
//       prisma.user.findUnique({ where: { id: userId } }),
//       prisma.listing.findUnique({ where: { id: listingId } }),
//     ]);

//     if (!user) return res.status(404).json({ error: 'User not found' });
//     if (!listing) return res.status(404).json({ error: 'Listing not found' });

//     // 3. Price Calculation
//     const start = new Date(checkIn);
//     const end = new Date(checkOut);
//     const nights = Math.ceil(
//       (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
//     );
//     const total = nights * listing.pricePerNight;

//     // 4. Create
//     const booking = await prisma.booking.create({
//       data: {
//         guestId: userId,
//         listingId,
//         checkIn: start,
//         checkOut: end,
//         guests,
//         totalPrice: total,
//         status: 'PENDING',
//       },
//     });

//     res.status(201).json(booking);
//   } catch (error) {
//     next(error);
//   }
// };

// PATCH /bookings/:id/status

// export const createBooking = async (req: AuthRequest, res: Response) => {
//   try {
//     if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });
//     const { listingId, checkIn, checkOut, guests = 1 } = req.body;
//     if (!listingId || !checkIn || !checkOut)
//       return res
//         .status(400)
//         .json({ message: 'listingId, checkIn and checkOut are required' });
//     const start = new Date(checkIn);
//     const end = new Date(checkOut);
//     if (isNaN(start.getTime()) || isNaN(end.getTime()))
//       return res.status(400).json({ message: 'Invalid date format' });
//     if (start >= end)
//       return res
//         .status(400)
//         .json({ message: 'checkOut must be after checkIn' });

//     const booking = await prisma.$transaction(async (tx) => {
//       const listing = await tx.listing.findUnique({
//         where: { id: Number(listingId) },
//       });
//       if (!listing) throw new Error('LISTING_NOT_FOUND');
//       if (listing.hostId === req.userId) throw new Error('OWN_LISTING');
//       if (Number(guests) > listing.guests) throw new Error('TOO_MANY_GUESTS');
//       const conflict = await tx.booking.findFirst({
//         where: {
//           listingId: Number(listingId),
//           status: { not: 'CANCELLED' },
//           checkIn: { lt: end },
//           checkOut: { gt: start },
//         },
//       });
//       if (conflict) throw new Error('BOOKING_CONFLICT');
//       const nights = Math.ceil(
//         (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
//       );
//       return tx.booking.create({
//         data: {
//           listingId: Number(listingId),
//           guestId: req.userId!,
//           checkIn: start,
//           checkOut: end,
//           guests: Number(guests),
//           totalPrice: nights * listing.pricePerNight,
//           status: 'CONFIRMED',
//         },
//         include: {
//           guest: {
//             select: { id: true, name: true, email: true, username: true },
//           },
//           listing: true,
//         },
//       });
//     });

//     await sendEmail(
//       booking.guest.email,
//       'Booking Confirmation',
//       bookingConfirmationEmail(
//         booking.guest.name,
//         booking.listing.title,
//         booking.listing.location,
//         formatDate(booking.checkIn),
//         formatDate(booking.checkOut),
//         booking.totalPrice,
//       ),
//     );
//     return res.status(201).json({ message: 'Booking created', booking });
//   } catch (error: any) {
//     if (error.message === 'LISTING_NOT_FOUND')
//       return res.status(404).json({ message: 'Listing not found' });
//     if (error.message === 'OWN_LISTING')
//       return res
//         .status(400)
//         .json({ message: 'You cannot book your own listing' });
//     if (error.message === 'TOO_MANY_GUESTS')
//       return res
//         .status(400)
//         .json({ message: 'Guests exceed listing capacity' });
//     if (error.message === 'BOOKING_CONFLICT')
//       return res
//         .status(409)
//         .json({ message: 'Booking conflict: dates already booked' });
//     return res
//       .status(500)
//       .json({ message: 'Failed to create booking', error: error.message });
//   }
// };

export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ✅ 1. Validate body (use your schema)
    const parsed = createBookingSchema.parse(req.body);
    const { listingId, checkIn, checkOut } = parsed;

    // ✅ 2. Get authenticated user (DO NOT trust client)
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    // ✅ 3. Validate dates
    if (end <= start) {
      return res.status(400).json({
        error: 'Check-out must be after check-in',
      });
    }

    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (nights <= 0) {
      return res.status(400).json({
        error: 'Invalid booking duration',
      });
    }

    // ✅ 4. Fetch user & listing in parallel
    const [user, listing] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.listing.findUnique({ where: { id: listingId } }),
    ]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // ✅ 5. Prevent double booking (date overlap check)
    const conflict = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        AND: [{ checkIn: { lt: end } }, { checkOut: { gt: start } }],
      },
    });

    if (conflict) {
      return res.status(400).json({
        error: 'Listing is already booked for the selected dates',
      });
    }

    // ✅ 6. Calculate total price (server-side)
    const total = nights * listing.pricePerNight;

    // ✅ 7. Use transaction for consistency
    const booking = await prisma.$transaction(async (tx) => {
      return tx.booking.create({
        data: {
          guestId: userId,
          listingId,
          checkIn: start,
          checkOut: end,
          totalPrice: total,
          status: 'CONFIRMED', // or 'PENDING' if approval flow
        },
      });
    });

    // ✅ 8. Send confirmation email (non-blocking optional improvement)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Booking Confirmed 🎉',
        html: bookingConfirmationEmail({
          guestName: user.name,
          listingTitle: listing.title,
          location: listing.location,
          checkIn: start.toISOString(),
          checkOut: end.toISOString(),
          totalPrice: total,
        }),
      });
    } catch (emailError) {
      console.error('⚠️ Email failed:', emailError);
      // Do NOT fail booking because of email
    }

    // ✅ 9. Return response
    res.status(201).json({
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    // ✅ 10. Handle validation errors cleanly
    if (error instanceof Error && 'issues' in error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: (error as any).issues,
      });
    }

    // return handleControllerError(res, error, 'Create Booking');
    next(error);
  }
};
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params['id'] as string;
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
    const id = req.params.id as string;
    const exists = await prisma.booking.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: 'Booking not found' });

    await prisma.booking.delete({ where: { id } });
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    next(error);
  }
};
