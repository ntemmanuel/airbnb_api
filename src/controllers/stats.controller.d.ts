import type { Request, Response, NextFunction } from "express";
/**
 * GET /listings/stats
 * Optimized: Runs 4 aggregations in 1 parallel trip to the DB.
 */
export declare const getListingStats: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /users/stats
 * Optimized: Grouped user counts with caching.
 */
export declare const getUserStats: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=stats.controller.d.ts.map