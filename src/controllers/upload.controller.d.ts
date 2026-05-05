import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
export declare const uploadAvatar: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteAvatar: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadListingPhotos: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteListingPhoto: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=upload.controller.d.ts.map