-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_key" ON "users"("phone");

-- AlterTable
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS "categories_isActive_idx" ON "categories"("isActive");

-- AlterTable
ALTER TABLE "artworks" ADD COLUMN IF NOT EXISTS "technique" TEXT;
