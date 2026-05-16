import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth"; // assuming you already have this

export async function POST(req: Request) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = verifyToken(token);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comicId } = await req.json();

    if (!comicId) {
      return NextResponse.json({ error: "Missing comicId" }, { status: 400 });
    }

    // check if already purchased
    const existing = await prisma.purchase.findUnique({
      where: {
        userId_comicId: {
          userId,
          comicId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Already purchased" });
    }

    const purchase = await prisma.purchase.create({
      data: {
        userId,
        comicId,
      },
    });

    return NextResponse.json({
      message: "Purchase successful",
      purchase,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Purchase failed" },
      { status: 500 }
    );
  }
}