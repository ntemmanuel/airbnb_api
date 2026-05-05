/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Guest feedback and property ratings
 */

// =============================================================
// FILE: src/routes/reviews.routes.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Review routes (Swagger compliant)
// =============================================================

import { Router } from 'express';
import {
  createReview,
  getListingReviews,
  deleteReview,
} from '../../controllers/reviews.controller.js';

import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /listings/{id}/reviews:
 *   get:
 *     summary: Get all reviews for a specific listing
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: The Listing ID to fetch reviews for
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated reviews with reviewer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       rating: { type: integer }
 *                       comment: { type: string }
 *                       user:
 *                         type: object
 *                         properties:
 *                           name: { type: string }
 *                           avatar: { type: string, nullable: true }
 *       404:
 *         description: Listing not found
 */

/**
 * =========================================================
 * GET /listings/:id/reviews
 * Public route (no auth required)
 * =========================================================
 */
router.get('/listings/:id/reviews', getListingReviews);
/**
 * @swagger
 * /listings/{id}/reviews:
 *   post:
 *     summary: Post a review for a listing
 *     description: Rating must be an integer between 1 and 5.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: The Listing ID being reviewed
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateReviewInput' }
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Review' }
 *       400:
 *         description: Validation error (e.g., rating out of range)
 *       401:
 *         description: Unauthorized (Must be logged in)
 *       404:
 *         description: Listing not found
 */

/**
 * =========================================================
 * POST /listings/:id/reviews
 * Requires authentication (bearer token)
 * =========================================================
 */
router.post('/listings/:id/reviews', authenticate, createReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     description: Only the author of the review or an ADMIN can delete it.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
/**
 * =========================================================
 * DELETE /reviews/:id
 * Requires authentication (owner or admin check handled in controller)
 * =========================================================
 */
router.delete('/reviews/:id', authenticate, deleteReview);

export default router;
