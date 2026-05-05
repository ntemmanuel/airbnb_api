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
import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';
// Configuration for the "Waiting Room" of database connections
const pool = new pg.Pool({
    connectionString: process.env['DATABASE_URL'],
    max: 10, // Only 10 people in the "waiting room" at once
    idleTimeoutMillis: 30000, // Close connection after 30s of no use
    connectionTimeoutMillis: 2000, // Give up if it takes > 2s to connect
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
// ---------------------------------------------------------------
// 2. connectDB — opens the database connection
// ---------------------------------------------------------------
// Called once at startup in index.ts before the server starts.
// If the connection fails, the error is thrown and the server
// won't start — better to fail loudly than start with no DB.
// ---------------------------------------------------------------
export async function connectDB() {
    await prisma.$connect();
    console.log('✅ Database connected successfully.');
}
// ---------------------------------------------------------------
// 3. EXPORT the prisma client for use in controllers
// ---------------------------------------------------------------
export default prisma;
//# sourceMappingURL=prisma.js.map