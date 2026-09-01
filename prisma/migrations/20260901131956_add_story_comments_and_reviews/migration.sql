/*
  Warnings:

  - A unique constraint covering the columns `[userId,storyId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_comicId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_comicId_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "storyId" TEXT,
ALTER COLUMN "comicId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "storyId" TEXT,
ALTER COLUMN "comicId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Comment_storyId_idx" ON "Comment"("storyId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "Review_comicId_idx" ON "Review"("comicId");

-- CreateIndex
CREATE INDEX "Review_storyId_idx" ON "Review"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_storyId_key" ON "Review"("userId", "storyId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;
