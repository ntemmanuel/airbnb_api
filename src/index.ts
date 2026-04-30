// =============================================================
// FILE: src/index.ts
// -------------------------------------------------------------
// RESPONSIBILITY: This is the ENTRY POINT of the entire app.
//   It's the first file that runs when you do "npm run dev".
//   Its job is to:
//     1. Initialize environment variables
//     2. Create the Express application
//     3. Apply global middleware (e.g. JSON body parsing)
//     4. Mount (register) all routers at their base URL paths
//     5. Connect to the Database
//     6. Start the HTTP server and listen for incoming requests
// =============================================================

// 1. LOAD ENVIRONMENT VARIABLES FIRST
// This must be the absolute first thing that happens so all 
// following code can access variables from your .env file.
import "dotenv/config";

import express from "express";
import type { Request, Response } from "express";

// Import the two routers we built.
import usersRouter from "./routes/users.routes.js";
import listingsRouter from './routes/listings.routes.js';
import bookingRouter from './routes/bookings.routes.js'

// Import the database connection utility (assumed path)
import { connectDB } from "./config/prisma.js";

const app = express();

// 2. GLOBAL MIDDLEWARE
app.use(express.json());

// 3. MOUNT ROUTERS
app.use('/users', usersRouter);
app.use('/listings', listingsRouter);
app.use('/bookings', bookingRouter)

// 4. CATCH-ALL 404 HANDLER
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// 5. STARTUP WRAPPER
// We use an async main function so we can wait for the database
// to connect successfully before we let users talk to our API.
async function main() {
  try {
    // Await the database connection
    await connectDB();
    console.log("✅ Database connected successfully");

    // Get PORT from environment or use 3000 as a backup
    const PORT = process.env["PORT"] || 3000;

    app.listen(PORT, () => {
      console.log(`✅ Server is running at http://localhost:${PORT}`);
      console.log(`   Users    → http://localhost:${PORT}/users`);
      console.log(`   Listings → http://localhost:${PORT}/listings`)
      console.log(`   Bookings → http://localhost:${PORT}/bookings`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

main();
