import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  context: any
) {
  const { comicId } = await context.params;

  try {
    const comments = await prisma.comment.findMany({
  where: {
    comicId,
  },
  include: {
    user: {
      select: {
        id: true,
        email: true,
      },
    },
    likes: true, // 🔥 REQUIRED
  },
  orderBy: {
    createdAt: "desc",
  },
});

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}