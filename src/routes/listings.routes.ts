// =============================================================
// FILE: src/routes/listings.routes.ts
// -------------------------------------------------------------
// RESPONSIBILITY: This file is a TRAFFIC DIRECTOR for /listings.
//   It maps URL + HTTP method → controller function.
//   Zero logic here — only routing.
//
// WHAT'S INSIDE:
//   1. An Express Router instance
//   2. Route definitions for each listings endpoint
//   3. Export the router so index.ts can mount it under /listings
// =============================================================

/**
 * @swagger
 * tags:
 *   name: Listings
 *   description: Property management, searching, and filtering
 */
import { Router } from 'express';
import { authenticate, requireHost } from '../middlewares/auth.middleware.js';
import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getListingStatsByLocation
} from '../controllers/listings.controller.js';

const router = Router();

// ---------------------------------------------------------------
// ROUTE DEFINITIONS
// ---------------------------------------------------------------
// Each line says: "for THIS method + THIS path, call THAT function."
// The router is mounted at /listings in index.ts, so "/" here
// actually means "/listings".
// ---------------------------------------------------------------

/**
 * @swagger
 * /listings:
 *   get:
 *     summary: Retrieve all listings with filters and pagination
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *         description: Filter by location (case-insensitive)
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [APARTMENT, HOUSE, VILLA, CABIN] }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: guests
 *         schema: { type: integer }
 *         description: Minimum number of guests required
 *     responses:
 *       200:
 *         description: Paginated listings retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Listing' }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 */
// Public routes
router.get('/', getAllListings);

router.get("/stats", getListingStatsByLocation);

/**
 * @swagger
 * /listings/{id}:
 *   get:
 *     summary: Get a specific listing by ID
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Listing found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Listing' }
 *       404:
 *         description: Listing not found
 */

router.get('/:id', getListingById);

/**
 * @swagger
 * /listings:
 *   post:
 *     summary: Create a new listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateListingInput' }
 *     responses:
 *       201:
 *         description: Listing created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Listing' }
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized (Must be a HOST)
 */
// Protected routes
router.post('/', authenticate, requireHost, createListing);

/**
 * @swagger
 * /listings/{id}:
 *   put:
 *     summary: Update an existing listing
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               pricePerNight: { type: number }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Listing updated
 *       401:
 *         description: Unauthorized (Only the owner or ADMIN)
 *       404:
 *         description: Listing not found
 */
router.put('/:id', authenticate, updateListing); // Ownership check happens in controller
router.delete('/:id', authenticate, deleteListing); // Ownership check happens in controller
/**
 * @swagger
 * /listings/stats:
 *   get:
 *     summary: Get high-level statistics of all listings
 *     tags: [Listings]
 *     responses:
 *       200:
 *         description: Statistics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalListings: { type: integer }
 *                 averagePrice: { type: number }
 *                 byLocation: { type: object }
 *                 byType: { type: object }
 */

export default router;
