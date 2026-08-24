-- AlterTable
ALTER TABLE "artworks" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "artworks_deletedAt_idx" ON "artworks"("deletedAt");
