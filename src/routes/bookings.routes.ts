// =============================================================
// FILE: src/routes/bookings.routes.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Route definitions for Bookings.
//   This file maps URL paths (endpoints) to the logic inside
//   bookings.controller.ts.
// =============================================================

import { Router } from 'express';
import { authenticate, requireGuest } from '../middlewares/auth.middleware.js';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/bookings.controller.js';
import {
  register,
  login,
  getMe,
  changePassword,
} from '../controllers/auth.controller.js';

const router = Router();

// These routes are mounted at "/bookings" in index.ts
// So a GET to "/" here is actually "GET /bookings" in the browser.

router.get('/', getAllBookings);
router.get('/:id', getBookingById);

// Protected
router.post('/', authenticate, requireGuest, createBooking);
router.delete('/:id', authenticate, deleteBooking);

router.post('/register', register);
router.post('/login', login);

// Authenticated Routes
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePassword);

export default router;
