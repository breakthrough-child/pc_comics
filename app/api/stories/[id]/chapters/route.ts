import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

/**
 * POST /api/stories/:id/chapters
 *
 * Admin only.
 * Adds a new chapter to the end of an existing story.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromToken(req);
  const { id } = await params;

  if (!user?.userId || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admins only" },
      { status: 403 }
    );
  }

  try {
    const { title, content, isFree, price, isPublished } =
      await req.json();

    if (!content || content.type !== "doc") {
      return NextResponse.json(
        { error: "Chapter content is required" },
        { status: 400 }
      );
    }

    const story = await prisma.story.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    const last = await prisma.chapter.findFirst({
      where: { storyId: id },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    const number = (last?.number || 0) + 1;

    const chapter = await prisma.chapter.create({
      data: {
        storyId: id,
        number,
        title: title?.trim() || `Chapter ${number}`,
        content,
        isFree: Boolean(isFree),
        price: Math.max(0, Math.round(Number(price) || 0)),
        isPublished: isPublished !== false,
      },
    });

    // Touch the story so it shows as recently updated.
    await prisma.story.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      message: "Chapter added",
      chapter,
    });
  } catch (error) {
    console.error("Failed to create chapter:", error);

    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}
