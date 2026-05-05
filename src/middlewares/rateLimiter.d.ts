/**
 * 1. General Limiter
 * Applied to all routes to prevent overall server abuse.
 * 100 requests every 15 minutes.
 */
export declare const generalLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * 2. Strict Limiter
 * Applied specifically to POST requests (Register, Login, Booking, etc.)
 * to prevent spamming and brute-force password guessing.
 * 20 requests every 15 minutes.
 */
export declare const strictLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimiter.d.ts.map