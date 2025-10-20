/*
  Warnings:

  - A unique constraint covering the columns `[companyId,name]` on the table `cameras` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "cameras_companyId_name_idx" ON "cameras"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "cameras_companyId_name_key" ON "cameras"("companyId", "name");
