// =============================================================
// FILE: src/index.ts
// =============================================================

import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import compression from 'compression';

import { setupSwagger } from './config/swagger.js';
import { connectDB } from './config/prisma.js';
import { generalLimiter, strictLimiter } from './middlewares/rateLimiter.js';

// v1 routers
import usersRouter from './routes/v1/users.routes.js';
import listingsRouter from './routes/v1/listings.routes.js';
import bookingRouter from './routes/v1/bookings.routes.js';
import authRouter from './routes/v1/auth.routes.js';
import uploadRouter from './routes/v1/upload.routes.js';
import morgan from "morgan";



const app = express();
app.use(process.env["NODE_ENV"] === "production" ? morgan("combined") : morgan("dev"));

// =============================================================
// GLOBAL MIDDLEWARE
// =============================================================
app.use(compression());
app.use(express.json());
app.use(generalLimiter);

// Swagger
setupSwagger(app);

// =============================================================
// HEALTH CHECK
// =============================================================
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// =============================================================
// API VERSION PREFIX
// =============================================================
const API_V1 = '/api/v1';

// =============================================================
// ROUTES
// =============================================================
app.use(`${API_V1}/auth`, strictLimiter, authRouter);
app.use(`${API_V1}/users`, usersRouter);
app.use(`${API_V1}/listings`, listingsRouter);
app.use(`${API_V1}/bookings`, strictLimiter, bookingRouter);
app.use(`${API_V1}/upload`, uploadRouter);

// =============================================================
// 404 HANDLER (ONLY ONE)
// =============================================================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// =============================================================
// ERROR HANDLER (ONLY ONE)
// =============================================================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('🔥 Error:', err.message);
  console.error(err.stack);

  res.status(500).json({
    error: 'Something went wrong',
  });
});

// =============================================================
// START SERVER
// =============================================================
async function main() {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');

    const PORT = Number(process.env.PORT) || 3000;

    app.listen(PORT, () => {
      console.log(`✅ Server running: http://localhost:${PORT}`);
      console.log(`📘 API Base: http://localhost:${PORT}/api/v1`);
      console.log(`   Auth     → /api/v1/auth`);
      console.log(`   Users    → /api/v1/users`);
      console.log(`   Listings → /api/v1/listings`);
      console.log(`   Bookings → /api/v1/bookings`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main();
