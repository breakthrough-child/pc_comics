import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { sendEmail } from "@/lib/email";

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
      storyId,
      text,
      parentId,
    } = await req.json();

    if (!storyId || !text?.trim()) {
      return NextResponse.json(
        { error: "Missing story or comment" },
        { status: 400 }
      );
    }

    const story = await prisma.story.findUnique({
      where: {
        id: storyId,
      },
      select: {
        id: true,
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: {
          id: parentId,
        },
      });

      if (!parent || parent.storyId !== storyId) {
        return NextResponse.json(
          { error: "Invalid reply target" },
          { status: 400 }
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        storyId,
        text: text.trim(),
        parentId: parentId || null,
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
    });

    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: {
          id: parentId,
        },
        include: {
          user: true,
        },
      });

      if (parent?.user?.email) {
        try {
          await sendEmail({
            to: parent.user.email,
            subject: "Someone replied to your comment 💬",
            text: "A user replied to your comment on a story.",
          });
        } catch (error) {
          console.error(
            "Story reply email failed:",
            error
          );
        }
      }
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error(
      "STORY COMMENT POST ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 }
    );
  }
}