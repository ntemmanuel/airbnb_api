import type { NextFunction, Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
export declare const getAllListings: (req: Request, res: Response) => Promise<void>;
/**
 * GET /listings/search
 * Optimized search using database indexes (location, type, price).
 */
export declare const searchListings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getListingById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getListingStatsByLocation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function createListing(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function updateListing(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteListing(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare const getListingsByHost: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=listings.controller.d.ts.map