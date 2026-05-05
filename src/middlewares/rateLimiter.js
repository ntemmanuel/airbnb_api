// =============================================================
// FILE: src/middlewares/rateLimiter.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Protects the server from brute-force attacks
//   and API abuse by limiting the number of requests per IP.
// =============================================================
import rateLimit from 'express-rate-limit';
/**
 * 1. General Limiter
 * Applied to all routes to prevent overall server abuse.
 * 100 requests every 15 minutes.
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
/**
 * 2. Strict Limiter
 * Applied specifically to POST requests (Register, Login, Booking, etc.)
 * to prevent spamming and brute-force password guessing.
 * 20 requests every 15 minutes.
 */
export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
        error: 'Too many attempts detected. Please wait 15 minutes before trying again.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimiter.js.map