import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
export declare const handleControllerError: (res: Response, error: unknown, operation: string) => Response<any, Record<string, any>>;
/**
 * GET /bookings
 * Optimized with Parallel fetching of data and total count.
 */
export declare const getAllBookings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /bookings/:id
 */
export declare const getBookingById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /users/:id/bookings
 */
export declare const getUserBookings: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /bookings
 * Logic: Validates entities, calculates price server-side, and creates record.
 */
export declare const createBooking: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateBookingStatus: (req: Request, res: Response) => Promise<void>;
/**
 * DELETE /bookings/:id
 */
export declare const deleteBooking: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=bookings.controller.d.ts.map