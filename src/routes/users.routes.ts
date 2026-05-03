// =============================================================
// FILE: src/routes/users.routes.ts
// -------------------------------------------------------------
// RESPONSIBILITY: This file is a TRAFFIC DIRECTOR for /users.
//   It maps each URL pattern + HTTP method to the right controller
//   function. NO logic lives here — only routing.
//
// Think of it as a menu:
//   "If the request is GET /users     → go to getAllUsers"
//   "If the request is POST /users    → go to createUser"
//   … and so on.
//
// WHAT'S INSIDE:
//   1. An Express Router instance
//   2. Route definitions (method + path → controller function)
//   3. Export the router so index.ts can mount it
// =============================================================

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile operations
 */
import { Router } from 'express';

// Import each controller function by name.
// These are the actual functions that contain the logic.
import {
  getAllUsers,
  getListingsByHost,
  getBookingsByGuest,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/users.controller.js';
import {
  getProfile,
  createProfile,
  updateProfile,
} from '../controllers/profiles.controller.js';

// Create a mini Express application that handles only /users routes.
// This router will be "mounted" at /users inside index.ts,
// so all paths here are RELATIVE to /users.
const router = Router();

// ---------------------------------------------------------------
// ROUTE DEFINITIONS
// ---------------------------------------------------------------
//
// router.get("/")        → handles GET  /users
// router.post("/")       → handles POST /users
// router.get("/:id")     → handles GET  /users/:id  (e.g. /users/1)
// router.put("/:id")     → handles PUT  /users/:id
// router.delete("/:id")  → handles DELETE /users/:id
//
// ":id" is a URL parameter — Express captures whatever is after the
// slash and makes it available as req.params.id in the controller.
// ---------------------------------------------------------------

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users (Paginated)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid token
 */
router.get('/', getAllUsers);
router.post('/', createUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique user ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

router.get('/:id', getUserById);
router.get('/:id/listings', getListingsByHost);
router.get('/:id/bookings', getBookingsByGuest);
router.get('/:id/profile', getProfile);
router.post('/:id/profile', createProfile);
router.put('/:id/profile', updateProfile);
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user profile
 *     description: Only the user themselves or an ADMIN can update this profile.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             # Using partial of RegisterInput (UpdateUserInput logic)
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               avatar: { type: string }
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put('/:id', updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Permanently removes user account. Restricted by 'Restrict' rule if bookings exist.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete('/:id', deleteUser);

// Export the router so index.ts can register it.
export default router;
