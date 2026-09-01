import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function POST(req: Request) {
  try {
    const payload = getUserFromToken(req);
    const userId = payload?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      comicId,
      storyId,
      rating,
      comment,
    } = await req.json();

    if ((!comicId && !storyId) || !rating) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    if (comicId && storyId) {
      return NextResponse.json(
        {
          error:
            "A review cannot belong to both a comic and a story",
        },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (storyId) {
      const review = await prisma.review.upsert({
        where: {
          userId_storyId: {
            userId,
            storyId,
          },
        },
        update: {
          rating,
          comment,
        },
        create: {
          userId,
          storyId,
          rating,
          comment,
        },
      });

      return NextResponse.json(review);
    }

    const review = await prisma.review.upsert({
      where: {
        userId_comicId: {
          userId,
          comicId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        userId,
        comicId,
        rating,
        comment,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("REVIEW ERROR:", error);

    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}