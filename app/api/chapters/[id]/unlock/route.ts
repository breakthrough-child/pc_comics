import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { canReadChapter, getReaderAccess } from "@/lib/chapters";

class UnlockError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/**
 * POST /api/chapters/:id/unlock
 *
 * Spends the reader's coins to unlock a paid chapter.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromToken(req);
  const userId = user?.userId;
  const { id } = await params;

  if (!userId) {
    return NextResponse.json(
      { error: "Please log in to unlock chapters" },
      { status: 401 }
    );
  }

  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        story: { select: { title: true, isPublished: true } },
      },
    });

    if (
      !chapter ||
      !chapter.isPublished ||
      !chapter.story.isPublished
    ) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    const access = await getReaderAccess(chapter.storyId, userId);

    if (canReadChapter(chapter, access, false)) {
      return NextResponse.json({
        message: "Chapter already unlocked",
        coins: access.coins,
      });
    }

    const price = chapter.price;

    const balance = await prisma.$transaction(async (tx) => {
      // Only deduct when the balance covers the price. Doing the check
      // inside the update keeps two quick taps from double-spending.
      const debit = await tx.user.updateMany({
        where: { id: userId, coins: { gte: price } },
        data: { coins: { decrement: price } },
      });

      if (debit.count === 0) {
        throw new UnlockError("Not enough coins", 402);
      }

      await tx.chapterUnlock.create({
        data: { userId, chapterId: id, coinsSpent: price },
      });

      await tx.coinTransaction.create({
        data: {
          userId,
          type: "UNLOCK",
          coins: -price,
          chapterId: id,
          description: `Unlocked ${chapter.story.title} – Chapter ${chapter.number}`,
        },
      });

      const updated = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { coins: true },
      });

      return updated.coins;
    });

    return NextResponse.json({
      message: "Chapter unlocked",
      coins: balance,
    });
  } catch (error: any) {
    if (error instanceof UnlockError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    // Unique constraint: a parallel request already unlocked it.
    if (error?.code === "P2002") {
      return NextResponse.json({
        message: "Chapter already unlocked",
      });
    }

    console.error("Failed to unlock chapter:", error);

    return NextResponse.json(
      { error: "Failed to unlock chapter" },
      { status: 500 }
    );
  }
}
