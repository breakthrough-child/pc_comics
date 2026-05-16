import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function POST(req: Request) {
  try {
    const payload = getUserFromToken(req);
    const userId = payload?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comicId, rating, comment } = await req.json();

    if (!comicId || !rating) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
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
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}