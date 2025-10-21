/*
  Warnings:

  - You are about to drop the column `ip` on the `audit_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "ip",
ADD COLUMN     "companyName" TEXT;
