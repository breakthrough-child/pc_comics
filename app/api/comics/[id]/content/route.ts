import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: Request,
  context: any
) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = verifyToken(token);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

const purchase = await prisma.purchase.findUnique({
  where: {
    userId_comicId: {
      userId,
      comicId: id,
    },
  },
});

    if (!purchase) {
      return NextResponse.json(
        { error: "Not purchased" },
        { status: 403 }
      );
    }

    const comic = await prisma.comic.findUnique({
  where: { id },
  select: {
    pages: true,
  },
});

if (!comic) {
  return NextResponse.json(
    { error: "Comic not found" },
    { status: 404 }
  );
}

return NextResponse.json({
  pages: Array.isArray(comic.pages) ? comic.pages : [],
});

    return NextResponse.json(comic);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}