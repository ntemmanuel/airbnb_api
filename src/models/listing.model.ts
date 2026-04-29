// =============================================================
// FILE: src/models/listing.model.ts
// -------------------------------------------------------------
// RESPONSIBILITY: This file is the "data layer" for listings.
//   - It defines the SHAPE of a Listing object (the interface).
//   - It stores the actual listing data in a plain array.
//
// Same idea as user.model.ts, but for property listings.
//
// WHAT'S INSIDE:
//   1. Listing interface — the blueprint every listing must follow
//   2. listings array   — the in-memory "table" of all listings
// =============================================================

// ---------------------------------------------------------------
// 1. THE LISTING INTERFACE
// ---------------------------------------------------------------
export interface Listing {
  id: number; // Auto-generated unique ID
  title: string; // Short headline, e.g. "Sunny Loft in Brooklyn"
  description: string; // Longer text describing the place
  location: string; // City/address, e.g. "Brooklyn, NY"
  pricePerNight: number; // Cost in USD per night
  guests: number; // Max number of guests allowed
  type: 'apartment' | 'house' | 'villa' | 'cabin'; // Category of property
  amenities: string[]; // List of features, e.g. ["WiFi", "Pool"]
  rating?: number; // Optional 0–5 star rating
  host: string; // Name (or ID) of the host
}

// ---------------------------------------------------------------
// 2. THE IN-MEMORY LISTINGS ARRAY
// ---------------------------------------------------------------
export const listings: Listing[] = [
  {
    id: 1,
    title: 'Sunny Loft in Brooklyn',
    description: 'A bright and airy loft with exposed brick and city views.',
    location: 'Brooklyn, NY',
    pricePerNight: 120,
    guests: 2,
    type: 'apartment',
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning'],
    rating: 4.7,
    host: 'Alice Johnson',
  },
  {
    id: 2,
    title: 'Cozy Mountain Cabin',
    description:
      'Escape the city and enjoy fresh mountain air in this rustic cabin.',
    location: 'Aspen, CO',
    pricePerNight: 200,
    guests: 6,
    type: 'cabin',
    amenities: ['Fireplace', 'Hot Tub', 'WiFi', 'Parking'],
    rating: 4.9,
    host: 'Carol White',
  },
  {
    id: 3,
    title: 'Modern Villa with Pool',
    description:
      'Luxury villa steps away from the beach. Perfect for families.',
    location: 'Miami, FL',
    pricePerNight: 450,
    guests: 10,
    type: 'villa',
    amenities: ['Pool', 'WiFi', 'BBQ', 'Beach Access', 'Gym'],
    rating: 4.5,
    host: 'Alice Johnson',
  },
];
