// =============================================================
// FILE: src/controllers/reviews.controller.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Review management with rating validation,
//   parallel queries, and time-based caching for performance.
// =============================================================

import type { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma.js";
import { cache } from "../config/cache.js";

/**
 * POST /listings/:id/reviews
 */
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listingId = Number(req.params.id);
    const { userId, rating, comment } = req.body;

    // 1. Validation
    if (!userId || !rating || !comment) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // 2. Check existence
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // 3. Create Review
    const review = await prisma.review.create({
      data: { userId, listingId, rating, comment }
    });

    // 4. PERFORMANCE: Clear cache for this listing so next GET gets fresh data
    cache.clear(); 

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /listings/:id/reviews
 */
export const getListingReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listingId = Number(req.params.id);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const cacheKey = `reviews_listing_${listingId}_p${page}_l${limit}`;

    // 1. PERFORMANCE: Check Cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    // 2. Check Listing
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // 3. Parallel Fetch
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where: { listingId },
        skip,
        take: limit,
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" }
      }),
      prisma.review.count({ where: { listingId } })
    ]);

    const response = {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };

    // 4. PERFORMANCE: Save to cache for 30 seconds
    cache.set(cacheKey, response, 30);

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /reviews/:id
 */
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const exists = await prisma.review.findUnique({ where: { id } });
    if (!exists) return res.status(404).json({ error: "Review not found" });

    await prisma.review.delete({ where: { id } });
    cache.clear(); // Ensure stale review data is removed from cache

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
};
