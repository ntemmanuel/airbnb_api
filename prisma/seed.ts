// =============================================================
// FILE: prisma/seed.ts
// -------------------------------------------------------------
// RESPONSIBILITY: Populates the database with initial test data.
//   Uses 'upsert' for idempotency and handles relations.
// =============================================================

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";

// Setup adapter for Prisma 7 compatibility
const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] as string });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding started...");

  // 1. CLEANUP (Reverse dependency order)
  // We delete bookings first, then listings, then users.
  await prisma.booking.deleteMany();
  await prisma.listingPhoto.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 2. CREATE USERS (Upsert makes this safe to run multiple times)
  const host1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "alice@example.com",
      username: "alice_host",
      password: hashedPassword,
      role: "HOST",
      phone: "+250780000001",
    },
  });

  const host2 = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Builder",
      email: "bob@example.com",
      username: "bob_host",
      password: hashedPassword,
      role: "HOST",
      phone: "+250780000002",
    },
  });

  const guest1 = await prisma.user.upsert({
    where: { email: "guest1@example.com" },
    update: {},
    create: {
      name: "Charlie Guest",
      email: "guest1@example.com",
      username: "charlie_g",
      password: hashedPassword,
      role: "GUEST",
      phone: "+250780000003",
    },
  });

  // 3. CREATE LISTINGS (Individually to get IDs for bookings)
  const listing1 = await prisma.listing.create({
    data: {
      title: "Modern Apartment Kigali",
      description: "Fast WiFi and great city views.",
      location: "Nyarutarama, Kigali",
      pricePerNight: 80.0,
      guests: 2,
      type: "APARTMENT",
      amenities: "WiFi, Gym, Parking",
      hostId: host1.id,
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      title: "Cozy Lake House",
      description: "Peaceful stay by the water.",
      location: "Gisenyi, Rubavu",
      pricePerNight: 150.0,
      guests: 4,
      type: "HOUSE",
      amenities: "Lake View, BBQ, WiFi",
      hostId: host1.id,
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      title: "Hillside Villa",
      description: "Luxury villa with a private pool.",
      location: "Rebero, Kigali",
      pricePerNight: 300.0,
      guests: 6,
      type: "VILLA",
      amenities: "Pool, Chef, AC",
      hostId: host2.id,
    },
  });

  const listing4 = await prisma.listing.create({
    data: {
      title: "Forest Cabin",
      description: "Escape to nature in this wooden cabin.",
      location: "Musanze",
      pricePerNight: 60.0,
      guests: 2,
      type: "CABIN",
      amenities: "Fireplace, Hiking, Garden",
      hostId: host2.id,
    },
  });

  // 4. CREATE BOOKINGS (Future Dates)
  const bookingsData = [
    {
      guestId: guest1.id,
      listingId: listing1.id,
      checkIn: new Date("2026-06-01"),
      checkout: new Date("2026-06-05"),
      nights: 4,
      price: listing1.pricePerNight,
      status: "CONFIRMED" as const,
    },
    {
      guestId: guest1.id,
      listingId: listing3.id,
      checkIn: new Date("2026-07-10"),
      checkout: new Date("2026-07-12"),
      nights: 2,
      price: listing3.pricePerNight,
      status: "PENDING" as const,
    },
  ];

  for (const b of bookingsData) {
    await prisma.booking.create({
      data: {
        guestId: b.guestId,
        listingId: b.listingId,
        checkIn: b.checkIn,
        checkout: b.checkout,
        totalPrice: b.nights * b.price,
        status: b.status,
      },
    });
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Close the PG pool
  });
