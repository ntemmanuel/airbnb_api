// =============================================================
// FILE: src/middlewares/auth.middleware.ts
// -------------------------------------------------------------
// RESPONSIBILITY: The "Security Gatekeeper" for protected routes.
//   It checks if the user has a valid "Keycard" (JWT).
// =============================================================

import 'dotenv/config';
import type { Request, Response, NextFunction } from 'express';
// import * as jwt from 'jsonwebtoken';
import * as jsonwebtoken from 'jsonwebtoken';

// 1. EXTEND THE REQUEST TYPE
// By default, Express Request doesn't know about userId or role.
// We extend it so we can carry this data through the app.
export interface AuthRequest extends Request {
  userId?: number;
  role?: string;
}

/**
 * Middleware: authenticate
 * Checks the "Authorization" header for a valid Bearer token.
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
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

    const secret = process.env['JWT_SECRET'] as string;

    if (!secret) {
      throw new Error('JWT_SECRET is missing in environment variables.');
    }

    // console.log("Extracted Token:", token);
    // FIX 2: Use unknown as a bridge to cast the payload
    // const decoded = jwt.verify(token, secret) as unknown as {
    //   userId: number;
    //   role: string;
    // };

    // ... then use it like this:
    const decoded = (jsonwebtoken.default as any).verify(token, secret);

    req.userId = decoded.userId;
    req.role = decoded.role;

    next();
  } catch (err: any) {
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
export const requireHost = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
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
export const requireGuest = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
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
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.role === 'ADMIN') {
    return next();
  }

  return res
    .status(403)
    .json({ error: 'Access denied. Administrator permissions required.' });
};
