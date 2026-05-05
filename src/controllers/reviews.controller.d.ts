import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
/**
 * POST /listings/:id/reviews
 */
export declare const createReview: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /listings/:id/reviews
 */
export declare const getListingReviews: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * DELETE /reviews/:id
 */
export declare const deleteReview: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=reviews.controller.d.ts.map