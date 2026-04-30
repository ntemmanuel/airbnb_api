// =============================================================
// FILE: src/controllers/listings.controller.ts
// -------------------------------------------------------------
// RESPONSIBILITY: All business logic for the Listings resource.
//
// NEW IN v2 (compared to the in-memory version):
//   - Real database queries with Prisma
//   - Advanced filtering: ?location=, ?type=, ?maxPrice=
//   - Pagination: ?page=1&limit=10
//   - Sorting: ?sortBy=pricePerNight&order=asc
//   - Only returns the host's name/avatar (not full user object)
//     on list views — bandwidth efficiency
//
// IMPORTANT CONCEPTS:
//   - req.query → URL query string params (the ?key=value part)
//   - req.query values are ALWAYS strings — parse before using
//   - "where" in Prisma = the SQL WHERE clause
//   - "skip" + "take" = SQL OFFSET + LIMIT (for pagination)
//   - "orderBy" = SQL ORDER BY
//   - "contains" with "mode: insensitive" = case-insensitive LIKE
// =============================================================

import type { Request, Response } from 'express';
import { Prisma, ListingType } from '../generated/prisma/client.js';
import prisma from '../config/prisma.js';

// ---------------------------------------------------------------
// GET /listings
// Returns all listings with optional filtering, sorting, pagination.
//
// Supported query params:
//   ?location=New York     → partial, case-insensitive match
//   ?type=VILLA            → exact enum match
//   ?maxPrice=200          → listings where pricePerNight <= 200
//   ?page=2&limit=5        → pagination (page 2, 5 results per page)
//   ?sortBy=pricePerNight  → sort field
//   ?order=asc             → sort direction (asc or desc)
// ---------------------------------------------------------------
export const getAllListings = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      res.status(400).json({ message: "Page and limit must be positive integers." });
      return;
    }

    const { location, type, maxPrice } = req.query;

    // 1. Initialize an empty filter object
    const where: any = {};

    // 2. Only add keys if they are defined
    if (location) {
      where.location = { contains: String(location), mode: "insensitive" };
    }

    if (type) {
      where.type = type;
    }

    if (maxPrice) {
      where.pricePerNight = { lte: parseFloat(maxPrice as string) };
    }

    // 3. Pass the constructed object to Prisma
    const listings = await prisma.listing.findMany({
      skip,
      take: limit,
      where, 
    });

    res.status(200).json(listings);
  } catch (error) {
    console.error("getAllListings error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};


// ---------------------------------------------------------------
// GET /listings/:id
// Returns one listing with its full host details and all bookings.
// ---------------------------------------------------------------
export const getListingById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        host: true, // full host object (name, email, avatar, etc.)
        bookings: {
          include: {
            guest: { select: { name: true, avatar: true } },
          },
        },
      },
    });

    if (!listing) {
      res.status(404).json({ message: `Listing with id ${id} not found.` });
      return;
    }

    res.status(200).json(listing);
  } catch (error) {
    console.error('getListingById error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// ---------------------------------------------------------------
// POST /listings
// Creates a new listing. Verifies the host exists first.
// ---------------------------------------------------------------
export const createListing = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      location,
      pricePerNight,
      guests,
      type,
      amenities,
      rating,
      hostId,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !pricePerNight ||
      !guests ||
      !type ||
      !amenities ||
      !hostId
    ) {
      res.status(400).json({
        message:
          'Missing required fields: title, description, location, pricePerNight, guests, type, amenities, hostId.',
      });
      return;
    }

    // Verify the host actually exists before creating the listing.
    // Without this check Prisma would throw a foreign key error (P2003)
    // which we could catch — but checking first gives a clearer message.
    const hostExists = await prisma.user.findFirst({ where: { id: hostId } });
    if (!hostExists) {
      res.status(404).json({ message: `Host with id ${hostId} not found.` });
      return;
    }

    const newListing = await prisma.listing.create({
      data: {
        title,
        description,
        location,
        pricePerNight,
        guests,
        type,
        amenities,
        rating,
        hostId,
      },
    });

    res.status(201).json(newListing);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2003 = foreign key constraint — hostId points to a non-existent user.
      if (error.code === 'P2003') {
        res
          .status(400)
          .json({ message: 'Invalid hostId — that user does not exist.' });
        return;
      }
    }
    console.error('createListing error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// ---------------------------------------------------------------
// PUT /listings/:id
// Updates a listing. Only the fields you send are changed.
// ---------------------------------------------------------------
export const updateListing = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);

    const existing = await prisma.listing.findFirst({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: `Listing with id ${id} not found.` });
      return;
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('updateListing error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// ---------------------------------------------------------------
// DELETE /listings/:id
// Removes a listing. Its bookings are deleted via Cascade.
// ---------------------------------------------------------------
export const deleteListing = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);

    const existing = await prisma.listing.findFirst({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: `Listing with id ${id} not found.` });
      return;
    }

    await prisma.listing.delete({ where: { id } });

    res
      .status(200)
      .json({ message: `Listing with id ${id} deleted successfully.` });
  } catch (error) {
    console.error('deleteListing error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// ---------------------------------------------------------------
// GET /users/:id/listings
// Returns all listings owned by a specific host.
// Defined here because the logic involves the Listing model.
// ---------------------------------------------------------------
export const getListingsByHost = async (req: Request, res: Response) => {
  try {
    const hostId = parseInt(req.params['id'] as string);

    const host = await prisma.user.findFirst({ where: { id: hostId } });
    if (!host) {
      res.status(404).json({ message: `User with id ${hostId} not found.` });
      return;
    }

    const listings = await prisma.listing.findMany({
      where: { hostId }, // SQL: WHERE hostId = X
    });

    res.status(200).json(listings);
  } catch (error) {
    console.error('getListingsByHost error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
