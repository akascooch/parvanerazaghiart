-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE');

-- AlterTable
ALTER TABLE "media" ADD COLUMN "storageKey" TEXT;
ALTER TABLE "media" ADD COLUMN "mimeType" TEXT;
ALTER TABLE "media" ADD COLUMN "sizeBytes" INTEGER;
ALTER TABLE "media" ADD COLUMN "kind" "MediaKind" NOT NULL DEFAULT 'IMAGE';

-- Backfill any existing rows before tightening constraints
UPDATE "media"
SET
  "storageKey" = 'legacy/' || "id",
  "mimeType" = 'application/octet-stream',
  "sizeBytes" = 0
WHERE "storageKey" IS NULL;

ALTER TABLE "media" ALTER COLUMN "storageKey" SET NOT NULL;
ALTER TABLE "media" ALTER COLUMN "mimeType" SET NOT NULL;
ALTER TABLE "media" ALTER COLUMN "sizeBytes" SET NOT NULL;

CREATE UNIQUE INDEX "media_storageKey_key" ON "media"("storageKey");
CREATE INDEX "media_artworkId_sortOrder_idx" ON "media"("artworkId", "sortOrder");
