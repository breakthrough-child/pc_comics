import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  context: any
) {
  const { storyId } = await context.params;

  try {
    const comments =
      await prisma.comment.findMany({
        where: {
          storyId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          likes: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(comments);
  } catch (error) {
    console.error(
      "STORY COMMENTS FETCH ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}