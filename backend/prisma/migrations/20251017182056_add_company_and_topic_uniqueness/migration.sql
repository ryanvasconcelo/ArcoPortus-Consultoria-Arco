/*
  Warnings:

  - A unique constraint covering the columns `[companyId,category,subcategory,item]` on the table `files` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "files_companyId_category_subcategory_item_key" ON "files"("companyId", "category", "subcategory", "item");
