// =============================================================
// FILE: src/middlewares/auth.middleware.ts
// -------------------------------------------------------------
// RESPONSIBILITY: The "Security Gatekeeper" for protected routes.
//   It checks if the user has a valid "Keycard" (JWT).
// =============================================================
import 'dotenv/config';
import jwt from 'jsonwebtoken';
/**
 * Middleware: authenticate
 * Checks the "Authorization" header for a valid Bearer token.
 */
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res
                .status(401)
                .json({ error: 'Access denied. No token provided.' });
        }
        // FIX 1: Extract the string and ensure it's not undefined
        // const token = authHeader.split(' ')[1];
        const token = authHeader?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Malformed token header.' });
        }
        const secret = process.env['JWT_SECRET'];
        if (!secret) {
            throw new Error('JWT_SECRET is missing in environment variables.');
        }
        const decoded = jwt.verify(token, secret);
        next();
    }
    catch (err) {
        // catch (error) {
        //   res.status(401).json({ error: 'Invalid or expired token.' });
        // }
        console.error('JWT Error Name:', err.name);
        console.error('JWT Error Message:', err.message);
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};
/**
 * Middleware: requireHost
 * Permits access only to HOSTs and ADMINs.
 * Used for creating/editing listings.
 */
export const requireHost = (req, res, next) => {
    // If authenticate ran correctly, req.role is already attached.
    if (req.role === 'HOST' || req.role === 'ADMIN') {
        return next();
    }
    // 403 Forbidden: We know who you are, but you aren't allowed here.
    return res
        .status(403)
        .json({ error: 'Access denied. Host permissions required.' });
};
/**
 * Middleware: requireGuest
 * Permits access only to GUESTs and ADMINs.
 * Used for making bookings.
 */
export const requireGuest = (req, res, next) => {
    if (req.role === 'GUEST' || req.role === 'ADMIN') {
        return next();
    }
    return res
        .status(403)
        .json({ error: 'Access denied. Guest permissions required.' });
};
/**
 * Middleware: requireAdmin
 * Permits access strictly to ADMINs.
 * Used for sensitive management tasks.
 */
export const requireAdmin = (req, res, next) => {
    if (req.role === 'ADMIN') {
        return next();
    }
    return res
        .status(403)
        .json({ error: 'Access denied. Administrator permissions required.' });
};
//# sourceMappingURL=auth.middleware.js.map