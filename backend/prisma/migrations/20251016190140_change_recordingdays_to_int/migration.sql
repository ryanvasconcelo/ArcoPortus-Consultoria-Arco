-- AlterTable
ALTER TABLE "cameras" ADD COLUMN     "area" TEXT,
ADD COLUMN     "businessUnit" TEXT,
ADD COLUMN     "hasAnalytics" BOOLEAN,
ADD COLUMN     "recordingDays" INTEGER,
ADD COLUMN     "type" TEXT;
