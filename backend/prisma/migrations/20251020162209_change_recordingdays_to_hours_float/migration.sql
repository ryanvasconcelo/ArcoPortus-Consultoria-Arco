/*
  Warnings:

  - You are about to drop the column `recordingDays` on the `cameras` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cameras" DROP COLUMN "recordingDays",
ADD COLUMN     "recordingHours" DOUBLE PRECISION;
