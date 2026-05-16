import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const payload = getUserFromToken(req);
    const userId = payload?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await req.json();

    // 🔍 Check if already liked
    const existing = await prisma.like.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
      include: {
        comment: {
          include: {
            user: true,
          },
        },
      },
    });

    // ❌ If already liked → UNLIKE
    if (existing) {
      await prisma.like.delete({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      return NextResponse.json({ liked: false });
    }

    // ✅ Otherwise → CREATE LIKE
    let like;

try {
  like = await prisma.like.create({
    data: {
      userId,
      commentId,
    },
    include: {
      comment: {
        include: {
          user: true,
        },
      },
    },
  });
} catch (e) {
  // already liked → ignore crash
  return NextResponse.json({ liked: false });
}

    // 💌 SEND EMAIL TO COMMENT OWNER
    const email = like.comment.user.email;

    if (email) {
      try {
            await sendEmail({
                to: email,
                subject: "❤️ Someone liked your comment",
                text: "A user liked your comment on a comic.",
            });
            } catch (e) {
            console.error("Email failed:", e);
            }
    }

    return NextResponse.json({ liked: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}