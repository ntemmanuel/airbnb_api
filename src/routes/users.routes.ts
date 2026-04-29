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

import { Router } from "express";

// Import each controller function by name.
// These are the actual functions that contain the logic.
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/users.controller.js";

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

router.get("/", getAllUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Export the router so index.ts can register it.
export default router;