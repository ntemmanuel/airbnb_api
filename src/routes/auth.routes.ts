// =============================================================
// FILE: src/routes/auth.routes.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Defines all authentication-related endpoints.
//   This includes registration, login, profile retrieval,
//   and password recovery logic.
// =============================================================

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration, login, and account management
 */
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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email or username already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// POST /auth/register - Create a new account
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Email and password required
 *       401:
 *         description: Invalid credentials
 */
// POST /auth/login - Get a JWT token
router.post('/login', login);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     description: Returns the same response whether the email is registered or not to prevent user enumeration.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, example: "emmanuel@klab.rw" }
 *     responses:
 *       200:
 *         description: Reset link sent (if email exists)
 */

// POST /auth/forgot-password - Request a reset link
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password using token from email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The raw reset token received via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token, or password too short
 */
// POST /auth/reset-password/:token - Set a new password using a token
router.post('/reset-password/:token', resetPassword);

// ---------------------------------------------------------------
// 2. PROTECTED ROUTES (Valid Token Required)
// ---------------------------------------------------------------

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get currently logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
// GET /auth/me - Get current user profile (uses 'authenticate' middleware)
router.get('/me', authenticate, getMe);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password while logged in
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: New password too short or fields missing
 *       401:
 *         description: Incorrect current password or unauthorized
 */
// POST /auth/change-password - Update password while logged in
router.post('/change-password', authenticate, changePassword);

export default router;
