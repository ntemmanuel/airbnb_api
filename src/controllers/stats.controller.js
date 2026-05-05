// =============================================================
// FILE: src/controllers/stats.controller.ts
// -------------------------------------------------------------
// RESPONSIBILITY: High-performance dashboard analytics using 
//   parallel queries and aggressive 5-minute caching.
// =============================================================
import prisma from "../config/prisma.js";
import { cache } from "../config/cache.js";
/**
 * GET /listings/stats
 * Optimized: Runs 4 aggregations in 1 parallel trip to the DB.
 */
export const getListingStats = async (req, res, next) => {
    try {
        const cacheKey = "listings_global_stats";
        // 1. Check Cache (5-minute TTL)
        const cachedStats = cache.get(cacheKey);
        if (cachedStats)
            return res.json(cachedStats);
        // 2. Parallel Aggregations
        const [totalListings, avgPriceData, byLocation, byType] = await Promise.all([
            prisma.listing.count(),
            prisma.listing.aggregate({
                _avg: { pricePerNight: true }
            }),
            prisma.listing.groupBy({
                by: ['location'],
                _count: { location: true }
            }),
            prisma.listing.groupBy({
                by: ['type'],
                _count: { type: true }
            })
        ]);
        const response = {
            totalListings,
            averagePrice: Number(avgPriceData._avg.pricePerNight?.toFixed(2)) || 0,
            byLocation,
            byType
        };
        // 3. Store in Cache for 300 seconds (5 minutes)
        cache.set(cacheKey, response, 300);
        res.json(response);
    }
    catch (error) {
        next(error);
    }
};
/**
 * GET /users/stats
 * Optimized: Grouped user counts with caching.
 */
export const getUserStats = async (req, res, next) => {
    try {
        const cacheKey = "users_global_stats";
        const cachedStats = cache.get(cacheKey);
        if (cachedStats)
            return res.json(cachedStats);
        const [totalUsers, byRole] = await Promise.all([
            prisma.user.count(),
            prisma.user.groupBy({
                by: ['role'],
                _count: { role: true }
            })
        ]);
        const response = {
            totalUsers,
            byRole
        };
        cache.set(cacheKey, response, 300);
        res.json(response);
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=stats.controller.js.map