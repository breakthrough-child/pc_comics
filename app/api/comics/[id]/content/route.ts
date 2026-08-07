import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: Request,
  context: any
) {
  try {
    const token = req.headers.get("cookie")?.split("token=")[1];

let userId: string | null = null;

if (token) {
  try {
    const payload = verifyToken(token);

    if (payload?.userId) {
      userId = payload.userId;
    }
  } catch {
    // Invalid token. Continue as guest.
  }
}

    const { id } = await context.params;

    const FREE_COMIC_IDS = [
  "0df75db3-6d94-4cfd-aea3-4f739081ab8f",
  "fccf9709-8be0-4d5d-96ab-1c609fcee7ee",
];

const isFreeComic = FREE_COMIC_IDS.includes(id);

if (!isFreeComic) {
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

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