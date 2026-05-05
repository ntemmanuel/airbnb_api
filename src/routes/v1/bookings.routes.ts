// =============================================================
// FILE: src/routes/bookings.routes.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Route definitions for Bookings.
//   This file maps URL paths (endpoints) to the logic inside
//   bookings.controller.ts.
// =============================================================

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Reservation management and scheduling
 */
import { Router } from 'express';
import {
  authenticate,
  requireGuest,
} from '../../middlewares/auth.middleware.js';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  deleteBooking,
} from '../../controllers/bookings.controller.js';
import {
  register,
  login,
  getMe,
  changePassword,
} from '../../controllers/auth.controller.js';

const router = Router();

// These routes are mounted at "/bookings" in index.ts
// So a GET to "/" here is actually "GET /bookings" in the browser.

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Retrieve all bookings (Admin view)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of all bookings with guest and listing details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Booking' }
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAllBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get specific booking details
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detailed booking information
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /users/{id}/bookings:
 *   get:
 *     summary: Get all bookings for a specific user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: The User ID to fetch bookings for
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: User's booking history retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/:id', getBookingById);

// Protected
/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     description: The 'totalPrice' is automatically calculated by the server (listing pricePerNight × number of nights).
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateBookingInput' }
 *     responses:
 *       201:
 *         description: Booking successfully created (status PENDING)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         description: Invalid dates or missing fields
 *       401:
 *         description: Unauthorized (Must be a GUEST)
 *       404:
 *         description: Listing not found
 *       409:
 *         description: Conflict - Dates already booked
 */
router.post('/', authenticate, requireGuest, createBooking);
/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     description: This performs a 'soft delete' by updating the status to CANCELLED.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       401:
 *         description: Unauthorized (Only the guest who booked or ADMIN)
 *       404:
 *         description: Booking not found
 */
router.delete('/:id', authenticate, deleteBooking);

router.post('/register', register);
router.post('/login', login);

// Authenticated Routes
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePassword);

export default router;
