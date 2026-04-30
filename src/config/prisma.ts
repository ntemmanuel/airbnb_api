// =============================================================
// FILE: src/config/prisma.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Creates and exports the Prisma Client — the
//   object your controllers use to talk to the database.
//
// Think of PrismaClient as the "API to your database". Instead
// of writing raw SQL like:
//   SELECT * FROM users WHERE id = 3;
// you write TypeScript like:
//   prisma.user.findUnique({ where: { id: 3 } })
// and Prisma writes the SQL for you — with full type safety.
//
// WHAT'S INSIDE:
//   1. PrismaClient setup using the pg adapter
//   2. connectDB() — a function to open the connection + log success
//   3. Default export of the prisma instance
//
// THE ADAPTER PATTERN:
//   @prisma/adapter-pg is a "driver adapter" that lets Prisma use
//   the popular "pg" library under the hood. This gives you more
//   control over connection pooling and is the modern recommended
//   approach for Node.js + PostgreSQL.
// =============================================================

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// ---------------------------------------------------------------
// 1. CREATE THE PRISMA CLIENT
// ---------------------------------------------------------------
// PrismaPg reads DATABASE_URL from process.env to know which
// PostgreSQL database to connect to.
//
// We create ONE prisma instance and reuse it everywhere.
// Creating multiple instances wastes database connections.
// ---------------------------------------------------------------
const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });

const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------
// 2. connectDB — opens the database connection
// ---------------------------------------------------------------
// Called once at startup in index.ts before the server starts.
// If the connection fails, the error is thrown and the server
// won't start — better to fail loudly than start with no DB.
// ---------------------------------------------------------------
export async function connectDB(): Promise<void> {
  await prisma.$connect();
  console.log('✅ Database connected successfully.');
}

// ---------------------------------------------------------------
// 3. EXPORT the prisma client for use in controllers
// ---------------------------------------------------------------
export default prisma;
