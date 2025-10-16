-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('DOCUMENT', 'SPREADSHEET', 'CAMERA_DATA', 'OTHER');

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimetype" TEXT NOT NULL,
    "type" "FileType" NOT NULL DEFAULT 'OTHER',
    "uploadedById" TEXT NOT NULL,
    "uploadedByName" TEXT,
    "companyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cameras" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "ipAddress" TEXT,
    "model" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cameras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "files_path_key" ON "files"("path");

-- CreateIndex
CREATE INDEX "files_companyId_idx" ON "files"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "cameras_ipAddress_key" ON "cameras"("ipAddress");

-- CreateIndex
CREATE INDEX "cameras_companyId_idx" ON "cameras"("companyId");
