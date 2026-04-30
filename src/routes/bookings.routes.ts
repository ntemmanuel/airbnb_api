// =============================================================
// FILE: src/routes/bookings.routes.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Route definitions for Bookings.
//   This file maps URL paths (endpoints) to the logic inside
//   bookings.controller.ts.
// =============================================================

import { Router } from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/bookings.controller.js';

const router = Router();

// These routes are mounted at "/bookings" in index.ts
// So a GET to "/" here is actually "GET /bookings" in the browser.

router.get('/', getAllBookings); // GET /bookings
router.get('/:id', getBookingById); // GET /bookings/:id
router.patch('/:id/status', updateBookingStatus);
router.post('/', createBooking); // POST /bookings
router.delete('/:id', deleteBooking); // DELETE /bookings/:id

export default router;
