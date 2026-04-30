 // =============================================================
// FILE: src/controllers/users.controller.ts
// -------------------------------------------------------------
// RESPONSIBILITY: All business logic for the Users resource.
//   Now uses Prisma to read/write a real PostgreSQL database
//   instead of an in-memory array.
//
// WHAT CHANGED FROM v1:
//   - "users.find()" → "prisma.user.findMany()"
//   - "users.push()" → "prisma.user.create()"
//   - "users.splice()" → "prisma.user.delete()"
//   - All functions are now "async" because database calls take
//     time (they're network requests). We must "await" them.
//   - All functions are wrapped in try/catch to handle DB errors.
//
// KEY PRISMA CONCEPTS USED HERE:
//   findMany()   → SELECT * FROM users  (get all)
//   findUnique() → SELECT * WHERE id = X  (get one by unique field)
//   findFirst()  → SELECT * WHERE id = X LIMIT 1  (used before update/delete)
//   create()     → INSERT INTO users
//   update()     → UPDATE users SET … WHERE id = X
//   delete()     → DELETE FROM users WHERE id = X
//   _count       → counts related records without fetching them
//   include      → JOINs related data (like JOIN in SQL)
// =============================================================

import type { Request, Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';
import prisma from '../config/prisma.js';

// ---------------------------------------------------------------
// GET /users
// Returns all users with a count of how many listings each has.
// ---------------------------------------------------------------
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      // "_count" tells Prisma: "don't fetch all listings, just count them"
      // This is more efficient than include: { listings: true }
      // because we'd be loading full listing objects we don't need.
      include: {
        _count: {
          select: { listings: true, bookings: true },
        },
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// ---------------------------------------------------------------
// GET /users/:id
// Returns a single user AND includes all their listings + bookings.
// Useful for a "profile page" view.
// ---------------------------------------------------------------
export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);

    const user = await prisma.user.findUnique({
      where: { id },
      // "include" tells Prisma to also fetch related data in one query.
      // Behind the scenes Prisma runs a JOIN — no extra roundtrips needed.
      include: {
        listings: true,
        bookings: {
          include: {
            listing: {
              // For bookings, only include the listing title and location
              // — we don't need the full listing object.
              select: { title: true, location: true },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: `User with id ${id} not found.` });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('getUserById error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// GET /users/:id/listings
export const getListingsByHost = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] as string);
  const listings = await prisma.listing.findMany({ where: { hostId: id } });
  res.status(200).json(listings);
};

// GET /users/:id/bookings
export const getBookingsByGuest = async (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] as string);
  const bookings = await prisma.booking.findMany({
    where: { guestId: id },
    include: { listing: true },
  });
  res.status(200).json(bookings);
};

// ---------------------------------------------------------------
// POST /users
// Creates a new user in the database.
// ---------------------------------------------------------------
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, username, phone, role, avatar, bio } = req.body;

    // Guard clause: check all required fields are present.
    if (!name || !email || !username || !phone || !role) {
      res.status(400).json({
        message: 'Missing required fields: name, email, username, phone, role.',
      });
      return;
    }

    const newUser = await prisma.user.create({
      // "data" is the object Prisma will INSERT into the database.
      data: { name, email, username, phone, role, avatar, bio },
    });

    res.status(201).json(newUser);
  } catch (error) {
    // PRISMA ERROR HANDLING
    // Prisma throws specific error codes for database constraint violations.
    // We check for them here to give the client a meaningful message.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 = "Unique constraint failed" — duplicate email or username.
      if (error.code === 'P2002') {
        res
          .status(409)
          .json({
            message: 'A user with that email or username already exists.',
          });
        return;
      }
    }
    console.error('createUser error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// ---------------------------------------------------------------
// PUT /users/:id
// Updates a user's fields. Only the fields you send are changed.
// ---------------------------------------------------------------
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);

    // findFirst() checks if the user exists BEFORE trying to update.
    // If we skip this and call update() directly on a missing id,
    // Prisma throws a P2025 error which we'd need to catch anyway —
    // doing it explicitly makes the code clearer.
    const existing = await prisma.user.findFirst({ where: { id } });

    if (!existing) {
      res.status(404).json({ message: `User with id ${id} not found.` });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: req.body, // Prisma only updates the fields included in req.body
    });

    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(409).json({ message: 'Email or username already in use.' });
        return;
      }
    }
    console.error('updateUser error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// ---------------------------------------------------------------
// DELETE /users/:id
// Permanently removes a user. Their listings + bookings are
// also deleted automatically because of "onDelete: Cascade"
// in the Prisma schema (the database handles this for us).
// ---------------------------------------------------------------
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params['id'] as string);

    const existing = await prisma.user.findFirst({ where: { id } });

    if (!existing) {
      res.status(404).json({ message: `User with id ${id} not found.` });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res
      .status(200)
      .json({ message: `User with id ${id} deleted successfully.` });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};