import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const payload = getUserFromToken(req);
  const userId = payload?.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { comicId, text, parentId } = await req.json();

  const comment = await prisma.comment.create({
    data: {
      userId,
      comicId,
      text,
      parentId: parentId || null,
    },
    include: {
      user: true,
    },
  });

  // 💌 REPLY EMAIL LOGIC (FIXED)
  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      include: { user: true },
    });

    if (parent?.user?.email) {
      try {
        await sendEmail({
            to: parent.user.email,
            subject: "Someone replied to your comment 💬",
            text: "A user replied to your comment on a comic.",
        });
        } catch (e) {
        console.error("Reply email failed:", e);
        }
    }
  }

  return NextResponse.json(comment);
}