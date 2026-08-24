-- AlterTable
ALTER TABLE "artworks" ADD COLUMN IF NOT EXISTS "collection" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "artworks_collection_idx" ON "artworks"("collection");
