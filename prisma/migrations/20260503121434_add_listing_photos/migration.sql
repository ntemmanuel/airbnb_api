/*
  Warnings:

  - You are about to drop the column `altText` on the `ListingPhoto` table. All the data in the column will be lost.
  - Added the required column `publicId` to the `ListingPhoto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ListingPhoto" DROP COLUMN "altText",
ADD COLUMN     "publicId" TEXT NOT NULL;
