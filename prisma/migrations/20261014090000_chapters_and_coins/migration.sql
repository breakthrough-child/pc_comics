-- AlterTable
ALTER TABLE "User" ADD COLUMN     "coins" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Story" ALTER COLUMN "content" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "price" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterUnlock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "coinsSpent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coins" INTEGER NOT NULL,
    "priceNaira" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "coins" INTEGER NOT NULL,
    "amountNaira" DOUBLE PRECISION,
    "reference" TEXT,
    "chapterId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoinTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chapter_storyId_number_idx" ON "Chapter"("storyId", "number");

-- CreateIndex
CREATE INDEX "ChapterUnlock_chapterId_idx" ON "ChapterUnlock"("chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterUnlock_userId_chapterId_key" ON "ChapterUnlock"("userId", "chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "CoinTransaction_reference_key" ON "CoinTransaction"("reference");

-- CreateIndex
CREATE INDEX "CoinTransaction_userId_createdAt_idx" ON "CoinTransaction"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterUnlock" ADD CONSTRAINT "ChapterUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterUnlock" ADD CONSTRAINT "ChapterUnlock_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Data: move each existing story's single body into its first chapter.
-- The migrated chapter is free; the admin can change that per chapter.
INSERT INTO "Chapter" ("id", "storyId", "number", "title", "content", "isFree", "price", "isPublished", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, s."id", 1, 'Chapter 1', s."content", true, 0, true, s."createdAt", CURRENT_TIMESTAMP
FROM "Story" s
WHERE s."content" IS NOT NULL;

-- Data: starter coin packages. Edit or remove them from Admin → Coins.
INSERT INTO "CoinPackage" ("id", "name", "coins", "priceNaira", "isActive", "sortOrder", "updatedAt") VALUES
  (gen_random_uuid()::text, 'Starter', 50, 500, true, 1, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Popular', 120, 1000, true, 2, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'Best Value', 300, 2000, true, 3, CURRENT_TIMESTAMP);
