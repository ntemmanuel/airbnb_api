// =============================================================
// FILE: src/controllers/listings.controller.ts
// -------------------------------------------------------------
// RESPONSIBILITY: This file contains ALL the business logic for
//   the Listings resource.
//
// Same structure as users.controller.ts — just for listings.
//
// WHAT'S INSIDE:
//   getAllListings    → GET    /listings
//   getListingById   → GET    /listings/:id
//   createListing    → POST   /listings
//   updateListing    → PUT    /listings/:id
//   deleteListing    → DELETE /listings/:id
// =============================================================

import type { Request, Response } from 'express';
import { listings, type Listing } from '../models/listing.model.js';

// Auto-incrementing ID counter for new listings.
let nextListingId = listings.length + 1;

// ---------------------------------------------------------------
// GET /listings
// Returns all listings.
// ---------------------------------------------------------------
export const getAllListings = (req: Request, res: Response) => {
  res.status(200).json(listings);
};

// ---------------------------------------------------------------
// GET /listings/:id
// Returns a single listing by its ID.
// ---------------------------------------------------------------
export const getListingById = (req: Request, res: Response) => {
  // URL params are always strings, so we parse the id to a number.
  const id = parseInt(req.params["id"] as string);

  const listing = listings.find((l) => l.id === id);

  if (!listing) {
    res.status(404).json({ message: `Listing with id ${id} not found.` });
    return;
  }

  res.status(200).json(listing);
};

// ---------------------------------------------------------------
// POST /listings
// Creates a new listing from the JSON body sent by the client.
//
// Example request body:
// {
//   "title": "Beachfront Cottage",
//   "description": "Wake up to ocean waves.",
//   "location": "Malibu, CA",
//   "pricePerNight": 300,
//   "guests": 4,
//   "type": "house",
//   "amenities": ["WiFi", "Beach Access"],
//   "host": "Alice Johnson"
// }
// ---------------------------------------------------------------
export const createListing = (req: Request, res: Response) => {
  const {
    title,
    description,
    location,
    pricePerNight,
    guests,
    type,
    amenities,
    rating,
    host,
  } = req.body;

  // GUARD CLAUSE: all required fields must be present.
  if (
    !title ||
    !description ||
    !location ||
    !pricePerNight ||
    !guests ||
    !type ||
    !amenities ||
    !host
  ) {
    res.status(400).json({
      message:
        'Missing required fields: title, description, location, pricePerNight, guests, type, amenities, host.',
    });
    return;
  }

  const newListing: Listing = {
    id: nextListingId++,
    title,
    description,
    location,
    pricePerNight,
    guests,
    type,
    amenities,
    host,
    ...(rating !== undefined && { rating }), // only add rating if it was provided
  };

  listings.push(newListing);

  res.status(201).json(newListing);
};

// ---------------------------------------------------------------
// PUT /listings/:id
// Updates an existing listing with whatever fields are in the body.
// Fields you don't include stay the same (partial update).
// ---------------------------------------------------------------
export const updateListing = (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);

  const index = listings.findIndex((l) => l.id === id);

  if (index === -1) {
    res.status(404).json({ message: `Listing with id ${id} not found.` });
    return;
  }

  // Spread keeps all old fields intact; req.body overwrites only what was sent.
  listings[index] = { ...listings[index], ...req.body };

  res.status(200).json(listings[index]);
};

// ---------------------------------------------------------------
// DELETE /listings/:id
// Removes a listing from the array.
// ---------------------------------------------------------------
export const deleteListing = (req: Request, res: Response) => {
  const id = parseInt(req.params["id"] as string);

  const index = listings.findIndex((l) => l.id === id);

  if (index === -1) {
    res.status(404).json({ message: `Listing with id ${id} not found.` });
    return;
  }

  listings.splice(index, 1);

  res
    .status(200)
    .json({ message: `Listing with id ${id} deleted successfully.` });
};
