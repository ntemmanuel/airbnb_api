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

import prisma from '../config/prisma.js';
import {
  createUserSchema,
  updateUserSchema,
} from '../validators/users.validator.js';
import { handleControllerError } from '../controllers/bookings.controller.js';
import bcrypt from 'bcrypt';
// ---------------------------------------------------------------
// GET /users
// Returns all users with a count of how many listings each has.
// ---------------------------------------------------------------
export const getAllUsers = async (req, res) => {
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
// GET /users/:id
export const getUserById = async (req, res, next) => {
  try {
    const id = req.params['id']; // ✅ FIXED
    if (!id) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        listings: {
          include: { _count: { select: { bookings: true } } },
        },
        bookings: {
          include: {
            listing: { select: { title: true, location: true } },
          },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
// GET /users/:id/listings
export const getListingsByHost = async (req, res) => {
  try {
    const id = req.params['id']; // ✅ FIXED
    if (!id) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const listings = await prisma.listing.findMany({
      where: { hostId: id }, // ✅ string FK
    });
    res.status(200).json(listings);
  } catch (error) {
    console.error('getListingsByHost error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
// GET /users/:id/bookings
export const getBookingsByGuest = async (req, res) => {
  try {
    const id = req.params['id']; // ✅ FIXED
    if (!id) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const bookings = await prisma.booking.findMany({
      where: { guestId: id }, // ✅ string FK
      include: { listing: true },
    });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('getBookingsByGuest error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
// ---------------------------------------------------------------
// POST /users
// Creates a new user in the database.
// ---------------------------------------------------------------
export const createUser = async (req, res) => {
  try {
    const result = createUserSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }
    // 1. Extract the raw password from validated data
    const { password, ...otherData } = result.data;
    // 2. Hash it (Prisma won't accept a missing or raw password if it's required)
    const hashedPassword = await bcrypt.hash(password, 10);
    // 3. Create the user with the hash
    const newUser = await prisma.user.create({
      data: {
        ...otherData,
        password: hashedPassword,
      },
    });
    // 4. Strip the password before sending back to client
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    handleControllerError(res, error, 'createUser');
  }
};
// ---------------------------------------------------------------
// PUT /users/:id
// Updates a user's fields. Only the fields you send are changed.
// ---------------------------------------------------------------
export const updateUser = async (req, res) => {
  try {
    const id = req.params['id']; // ✅ FIXED
    if (!id) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      });
    }
    const updated = await prisma.user.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json(updated);
  } catch (error) {
    handleControllerError(res, error, 'updateUser');
  }
};
// ---------------------------------------------------------------
// DELETE /users/:id
// Permanently removes a user. Their listings + bookings are
// also deleted automatically because of "onDelete: Cascade"
// in the Prisma schema (the database handles this for us).
// ---------------------------------------------------------------
export const deleteUser = async (req, res) => {
  try {
    const id = req.params['id']; // ✅ FIXED
    if (!id) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: `User not found.` });
    }
    await prisma.user.delete({ where: { id } });
    res.status(200).json({
      message: `User deleted successfully.`,
    });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
//# sourceMappingURL=users.controller.js.map
