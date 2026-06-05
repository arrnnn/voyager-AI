/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "shareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Trip_shareToken_key" ON "Trip"("shareToken");

-- CreateIndex
CREATE INDEX "Trip_shareToken_idx" ON "Trip"("shareToken");
