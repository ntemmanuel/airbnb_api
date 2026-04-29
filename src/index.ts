// =============================================================
// FILE: src/index.ts
// -------------------------------------------------------------
// RESPONSIBILITY: This is the ENTRY POINT of the entire app.
//   It's the first file that runs when you do "npm run dev".
//   Its job is to:
//     1. Create the Express application
//     2. Apply global middleware (e.g. JSON body parsing)
//     3. Mount (register) all routers at their base URL paths
//     4. Add a catch-all 404 handler for unknown routes
//     5. Start the HTTP server and listen for incoming requests
//
// Think of this file as the "front door" of your API.
//   Every request comes in here first, gets directed to the right
//   router, which then sends it to the right controller.
//
// FLOW OF A REQUEST:
//   Client → index.ts → router (users/listings) → controller → response
// =============================================================

import express from "express";
import type { Request, Response } from "express";


// Import the two routers we built.
import usersRouter from "./routes/users.routes.js";
import listingsRouter from './routes/listings.routes.js';

// ---------------------------------------------------------------
// 1. CREATE THE EXPRESS APP
// ---------------------------------------------------------------
// express() returns an application object we can configure and start.
const app = express();

// ---------------------------------------------------------------
// 2. GLOBAL MIDDLEWARE
// ---------------------------------------------------------------
// Middleware runs on EVERY request before it hits a route handler.
//
// express.json() reads the raw JSON text from the request body and
// converts it into a JavaScript object available as req.body.
// Without this, req.body would be undefined for POST/PUT requests.
// ---------------------------------------------------------------
app.use(express.json());

// ---------------------------------------------------------------
// 3. MOUNT ROUTERS
// ---------------------------------------------------------------
// app.use(path, router) tells Express:
//   "Any request that starts with /users → hand it to usersRouter"
//   "Any request that starts with /listings → hand it to listingsRouter"
//
// The router then matches the REST of the URL against its own routes.
// Example: GET /users/3
//   → usersRouter receives the path "/3"
//   → matches router.get("/:id", getUserById)
//   → calls getUserById with id = 3
// ---------------------------------------------------------------
app.use('/users', usersRouter);
app.use('/listings', listingsRouter);

// ---------------------------------------------------------------
// 4. CATCH-ALL 404 HANDLER
// ---------------------------------------------------------------
// If a request reaches here, no route above matched it.
// We send a 404 Not Found response so the client knows the URL
// doesn't exist in our API.
//
// IMPORTANT: This must be registered AFTER all other routes.
// Express runs middleware/routes in the order they are registered.
// ---------------------------------------------------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ---------------------------------------------------------------
// 5. START THE SERVER
// ---------------------------------------------------------------
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
  console.log(`   Users    → http://localhost:${PORT}/users`);
  console.log(`   Listings → http://localhost:${PORT}/listings`);
});
