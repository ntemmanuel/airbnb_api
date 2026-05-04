/*
  Warnings:

  - You are about to drop the column `checkout` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `checkOut` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "checkout",
ADD COLUMN     "checkOut" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_listingId_idx" ON "Review"("listingId");

-- CreateIndex
CREATE INDEX "Booking_guestId_idx" ON "Booking"("guestId");

-- CreateIndex
CREATE INDEX "Booking_listingId_idx" ON "Booking"("listingId");

-- CreateIndex
CREATE INDEX "Listing_hostId_idx" ON "Listing"("hostId");

-- CreateIndex
CREATE INDEX "Listing_location_idx" ON "Listing"("location");

-- CreateIndex
CREATE INDEX "Listing_type_idx" ON "Listing"("type");

-- CreateIndex
CREATE INDEX "Listing_pricePerNight_idx" ON "Listing"("pricePerNight");

-- CreateIndex
CREATE INDEX "User_name_idx" ON "User"("name");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
