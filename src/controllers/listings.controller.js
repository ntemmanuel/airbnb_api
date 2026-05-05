// =============================================================
// FILE: src/controllers/listings.controller.ts
// -------------------------------------------------------------
// RESPONSIBILITY: All business logic for the Listings resource.
//
// NEW IN v2 (compared to the in-memory version):
//   - Real database queries with Prisma
//   - Advanced filtering: ?location=, ?type=, ?maxPrice=
//   - Pagination: ?page=1&limit=10
//   - Sorting: ?sortBy=pricePerNight&order=asc
//   - Only returns the host's name/avatar (not full user object)
//     on list views — bandwidth efficiency
//
// IMPORTANT CONCEPTS:
//   - req.query → URL query string params (the ?key=value part)
//   - req.query values are ALWAYS strings — parse before using
//   - "where" in Prisma = the SQL WHERE clause
//   - "skip" + "take" = SQL OFFSET + LIMIT (for pagination)
//   - "orderBy" = SQL ORDER BY
//   - "contains" with "mode: insensitive" = case-insensitive LIKE
// =============================================================
import { createListingSchema, updateListingSchema, } from '../validators/listings.validator.js';
import prisma from '../config/prisma.js';
import { handleControllerError } from '../controllers/bookings.controller.js';
// ---------------------------------------------------------------
// GET /listings
// Returns all listings with optional filtering, sorting, pagination.
//
// Supported query params:
//   ?location=New York     → partial, case-insensitive match
//   ?type=VILLA            → exact enum match
//   ?maxPrice=200          → listings where pricePerNight <= 200
//   ?page=2&limit=5        → pagination (page 2, 5 results per page)
//   ?sortBy=pricePerNight  → sort field
//   ?order=asc             → sort direction (asc or desc)
// ---------------------------------------------------------------
export const getAllListings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        if (page < 1 || limit < 1) {
            res
                .status(400)
                .json({ message: 'Page and limit must be positive integers.' });
            return;
        }
        const { location, type, maxPrice } = req.query;
        // 1. Initialize an empty filter object
        const where = {};
        // 2. Only add keys if they are defined
        if (location) {
            where.location = { contains: String(location), mode: 'insensitive' };
        }
        if (type) {
            where.type = type;
        }
        if (maxPrice) {
            where.pricePerNight = { lte: parseFloat(maxPrice) };
        }
        // 3. Pass the constructed object to Prisma
        const listings = await prisma.listing.findMany({
            skip,
            take: limit,
            where,
            include: {
                // 1. Only get specific host info to keep response light
                host: {
                    select: { name: true, avatar: true },
                },
                // 2. Count bookings without loading the actual booking objects
                _count: {
                    select: { bookings: true },
                },
            },
        });
        res.status(200).json(listings);
    }
    catch (error) {
        handleControllerError(res, error, 'getAllListings');
    }
};
/**
 * GET /listings/search
 * Optimized search using database indexes (location, type, price).
 */
export const searchListings = async (req, res, next) => {
    try {
        const { location, type, minPrice, maxPrice, guests, page = 1, limit = 10, } = req.query;
        const p = Number(page);
        const l = Number(limit);
        const skip = (p - 1) * l;
        // Build conditional filters
        const where = {};
        if (location) {
            where.location = { contains: String(location), mode: 'insensitive' };
        }
        if (type) {
            where.type = String(type);
        }
        if (guests) {
            where.guests = { gte: Number(guests) };
        }
        if (minPrice || maxPrice) {
            where.pricePerNight = {
                gte: minPrice ? Number(minPrice) : undefined,
                lte: maxPrice ? Number(maxPrice) : undefined,
            };
        }
        // Parallel Execution for speed
        const [data, total] = await Promise.all([
            prisma.listing.findMany({
                where,
                skip,
                take: l,
                include: {
                    host: {
                        select: { name: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.listing.count({ where }),
        ]);
        res.json({
            data,
            meta: {
                total,
                page: p,
                limit: l,
                totalPages: Math.ceil(total / l),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
// ---------------------------------------------------------------
// GET /listings/:id
// Returns one listing with its full host details and all bookings.
// ---------------------------------------------------------------
export const getListingById = async (req, res) => {
    try {
        const id = req.params['id']; // ✅ FIXED
        if (!id) {
            return res.status(400).json({ error: 'Invalid listing ID' });
        }
        const listing = await prisma.listing.findUnique({
            where: { id }, // ✅ string UUID
            include: {
                host: true,
                bookings: {
                    include: {
                        guest: { select: { name: true, avatar: true } },
                    },
                },
            },
        });
        if (!listing) {
            return res.status(404).json({ message: `Listing not found.` });
        }
        res.status(200).json(listing);
    }
    catch (error) {
        console.error('getListingById error:', error);
        res.status(500).json({ message: 'Something went wrong.' });
    }
};
// GET /listings/stats
export const getListingStatsByLocation = async (req, res, next) => {
    try {
        // We use $queryRaw for complex grouping and rounding
        // Note: Table names in Prisma/Postgres are usually lowercase unless quoted
        const stats = await prisma.$queryRaw `
      SELECT 
        location, 
        COUNT(*)::int AS total, 
        ROUND(AVG("pricePerNight")::numeric, 2) AS avg_price,
        MIN("pricePerNight") AS min_price,
        MAX("pricePerNight") AS max_price
      FROM "Listing"
      GROUP BY location
      ORDER BY total DESC
    `;
        res.status(200).json(stats);
    }
    catch (error) {
        next(error);
    }
};
// POST /listings
export async function createListing(req, res, next) {
    try {
        const validatedData = createListingSchema.parse(req.body);
        // SECURITY: We ignore any hostId sent in req.body and use the verified token ID
        const listing = await prisma.listing.create({
            data: {
                ...validatedData,
                hostId: req.userId, // Attached by authenticate middleware
                amenities: validatedData.amenities.join(', '),
            },
        });
        res.status(201).json(listing);
    }
    catch (error) {
        next(error);
    }
}
// PUT /listings/:id
export async function updateListing(req, res, next) {
    try {
        const id = req.params['id']; // ✅ FIXED
        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        if (listing.hostId !== req.userId && req.role !== 'ADMIN') {
            return res.status(403).json({
                error: 'You can only edit your own listings',
            });
        }
        const updated = await prisma.listing.update({
            where: { id },
            data: req.body,
        });
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
}
// DELETE /listings/:id
export async function deleteListing(req, res, next) {
    try {
        const id = req.params['id']; // ✅ FIXED
        const listing = await prisma.listing.findUnique({ where: { id } });
        if (!listing) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        if (listing.hostId !== req.userId && req.role !== 'ADMIN') {
            return res.status(403).json({
                error: 'You can only delete your own listings',
            });
        }
        await prisma.listing.delete({ where: { id } });
        res.json({ message: 'Listing deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}
// ---------------------------------------------------------------
// GET /users/:id/listings
// Returns all listings owned by a specific host.
// Defined here because the logic involves the Listing model.
// ---------------------------------------------------------------
export const getListingsByHost = async (req, res) => {
    try {
        const hostId = req.params['id']; // ✅ FIXED
        if (!hostId) {
            return res.status(400).json({ message: 'Invalid host ID' });
        }
        const host = await prisma.user.findUnique({ where: { id: hostId } });
        if (!host) {
            return res.status(404).json({ message: `User not found.` });
        }
        const listings = await prisma.listing.findMany({
            where: { hostId }, // ✅ string
        });
        res.status(200).json(listings);
    }
    catch (error) {
        console.error('getListingsByHost error:', error);
        res.status(500).json({ message: 'Something went wrong.' });
    }
};
//# sourceMappingURL=listings.controller.js.map