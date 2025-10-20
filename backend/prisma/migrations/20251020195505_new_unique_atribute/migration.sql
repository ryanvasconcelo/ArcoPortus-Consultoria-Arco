/*
  Warnings:

  - A unique constraint covering the columns `[companyId,ipAddress]` on the table `cameras` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."cameras_companyId_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "cameras_companyId_ipAddress_key" ON "cameras"("companyId", "ipAddress");
