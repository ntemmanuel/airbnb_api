import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
/**
 * POST /auth/register
 * Creates a new user account with a hashed password.
 */
export declare function register(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /auth/login
 * Verifies credentials and issues a digital "keycard" (JWT).
 */
export declare function login(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * GET /auth/me
 * Retrieves the currently logged-in user's profile and relevant data.
 */
export declare function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /auth/change-password
 * Allows a logged-in user to update their password.
 */
export declare function changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /auth/forgot-password
 * Sends a secure reset link to the user's email if they exist.
 */
export declare function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * POST /auth/reset-password/:token
 * Validates the token and updates the password.
 */
export declare function resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.controller.d.ts.map