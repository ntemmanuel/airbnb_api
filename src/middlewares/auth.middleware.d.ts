import 'dotenv/config';
import type { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    userId?: string;
    role?: string;
}
/**
 * Middleware: authenticate
 * Checks the "Authorization" header for a valid Bearer token.
 */
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware: requireHost
 * Permits access only to HOSTs and ADMINs.
 * Used for creating/editing listings.
 */
export declare const requireHost: (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Middleware: requireGuest
 * Permits access only to GUESTs and ADMINs.
 * Used for making bookings.
 */
export declare const requireGuest: (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Middleware: requireAdmin
 * Permits access strictly to ADMINs.
 * Used for sensitive management tasks.
 */
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=auth.middleware.d.ts.map