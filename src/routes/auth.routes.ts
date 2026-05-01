// =============================================================
// FILE: src/routes/auth.routes.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Defines all authentication-related endpoints.
//   This includes registration, login, profile retrieval,
//   and password recovery logic.
// =============================================================

import { Router } from 'express';
import {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// ---------------------------------------------------------------
// 1. PUBLIC ROUTES (No Token Required)
// ---------------------------------------------------------------

// POST /auth/register - Create a new account
router.post('/register', register);

// POST /auth/login - Get a JWT token
router.post('/login', login);

// POST /auth/forgot-password - Request a reset link
router.post('/forgot-password', forgotPassword);

// POST /auth/reset-password/:token - Set a new password using a token
router.post('/reset-password/:token', resetPassword);

// ---------------------------------------------------------------
// 2. PROTECTED ROUTES (Valid Token Required)
// ---------------------------------------------------------------

// GET /auth/me - Get current user profile (uses 'authenticate' middleware)
router.get('/me', authenticate, getMe);

// POST /auth/change-password - Update password while logged in
router.post('/change-password', authenticate, changePassword);

export default router;
