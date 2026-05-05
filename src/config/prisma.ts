// src/config/prisma.ts

import { PrismaClient } from '@prisma/client'; // ✅ FIXED
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({
  connectionString: process.env['DATABASE_URL'],
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function connectDB(): Promise<void> {
  await prisma.$connect();
  console.log('✅ Database connected successfully.');
}

export default prisma;