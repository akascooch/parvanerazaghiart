-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'READ', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "inquiries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "artworkSlug" TEXT,
    "artworkId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "inquiries_createdAt_idx" ON "inquiries"("createdAt");
CREATE INDEX IF NOT EXISTS "inquiries_status_idx" ON "inquiries"("status");
CREATE INDEX IF NOT EXISTS "inquiries_artworkId_idx" ON "inquiries"("artworkId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "inquiries"
    ADD CONSTRAINT "inquiries_artworkId_fkey"
    FOREIGN KEY ("artworkId") REFERENCES "artworks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
