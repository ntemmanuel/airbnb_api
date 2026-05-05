// =============================================================
// FILE: src/controllers/reviews.controller.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Review management with rating validation,
//   parallel queries, and time-based caching for performance.
// =============================================================
import prisma from '../config/prisma.js';
import { cache } from '../config/cache.js';
/**
 * POST /listings/:id/reviews
 */
export const createReview = async (req, res, next) => {
    try {
        const listingId = req.params.id;
        const { rating, comment } = req.body;
        const userId = req.userId; // ✅ from JWT
        // 401 check (Swagger requirement)
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Validation
        if (!rating || !comment) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        // Check listing exists
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        // Create review
        const review = await prisma.review.create({
            data: {
                userId,
                listingId,
                rating,
                comment,
            },
        });
        cache.clear();
        return res.status(201).json(review);
    }
    catch (error) {
        next(error);
    }
};
/**
 * GET /listings/:id/reviews
 */
export const getListingReviews = async (req, res, next) => {
    try {
        const listingId = req.params.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const cacheKey = `reviews_listing_${listingId}_p${page}_l${limit}`;
        // 1. PERFORMANCE: Check Cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData)
            return res.json(cachedData);
        // 2. Check Listing
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });
        if (!listing)
            return res.status(404).json({ error: 'Listing not found' });
        // 3. Parallel Fetch
        const [data, total] = await Promise.all([
            prisma.review.findMany({
                where: { listingId },
                skip,
                take: limit,
                include: { user: { select: { name: true, avatar: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.review.count({ where: { listingId } }),
        ]);
        const response = {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
        // 4. PERFORMANCE: Save to cache for 30 seconds
        cache.set(cacheKey, response, 30);
        res.json(response);
    }
    catch (error) {
        next(error);
    }
};
/**
 * DELETE /reviews/:id
 */
export const deleteReview = async (req, res, next) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        const role = req.role;
        // 401 Unauthorized
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const review = await prisma.review.findUnique({
            where: { id },
        });
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        // 🔐 Authorization rule
        const isOwner = review.userId === userId;
        const isAdmin = role === 'ADMIN';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                error: 'You are not allowed to delete this review',
            });
        }
        await prisma.review.delete({
            where: { id },
        });
        cache.clear();
        return res.json({ message: 'Review deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=reviews.controller.js.map