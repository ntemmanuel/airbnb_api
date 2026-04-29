// =============================================================
// FILE: src/routes/listings.routes.ts
// -------------------------------------------------------------
// RESPONSIBILITY: This file is a TRAFFIC DIRECTOR for /listings.
//   It maps URL + HTTP method → controller function.
//   Zero logic here — only routing.
//
// WHAT'S INSIDE:
//   1. An Express Router instance
//   2. Route definitions for each listings endpoint
//   3. Export the router so index.ts can mount it under /listings
// =============================================================

import { Router } from "express";

import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from "../controllers/listings.controller.js";

const router = Router();

// ---------------------------------------------------------------
// ROUTE DEFINITIONS
// ---------------------------------------------------------------
// Each line says: "for THIS method + THIS path, call THAT function."
// The router is mounted at /listings in index.ts, so "/" here
// actually means "/listings".
// ---------------------------------------------------------------

router.get("/", getAllListings);
router.post("/", createListing);
router.get("/:id", getListingById);
router.put("/:id", updateListing);
router.delete("/:id", deleteListing);

export default router;