import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";
import {
  canReadChapter,
  getReaderAccess,
  renumberChapters,
} from "@/lib/chapters";

/**
 * GET /api/chapters/:id
 *
 * Returns the chapter with its content when the reader has access.
 * Locked chapters are returned without content so the reader can
 * show the unlock screen.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromToken(req);
  const userId = user?.userId || null;
  const isAdmin = user?.role === "ADMIN";
  const { id } = await params;

  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        story: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            isPublished: true,
            chapters: {
              where: isAdmin ? {} : { isPublished: true },
              orderBy: { number: "asc" },
              select: {
                id: true,
                number: true,
                title: true,
                isFree: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (
      !chapter ||
      (!isAdmin &&
        (!chapter.isPublished || !chapter.story.isPublished))
    ) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    const access = await getReaderAccess(chapter.storyId, userId);
    const canRead = canReadChapter(chapter, access, isAdmin);

    const siblings = chapter.story.chapters.map((c) => ({
      ...c,
      isFree: c.isFree || c.price <= 0,
      canRead: canReadChapter(c, access, isAdmin),
    }));

    const index = siblings.findIndex((c) => c.id === chapter.id);

    return NextResponse.json({
      chapter: {
        id: chapter.id,
        storyId: chapter.storyId,
        number: chapter.number,
        title: chapter.title,
        isFree: chapter.isFree || chapter.price <= 0,
        price: chapter.price,
        isPublished: chapter.isPublished,
        canRead,
        content: canRead ? chapter.content : null,
      },
      story: {
        id: chapter.story.id,
        title: chapter.story.title,
        coverImage: chapter.story.coverImage,
      },
      chapters: siblings,
      prev: index > 0 ? siblings[index - 1] : null,
      next:
        index >= 0 && index < siblings.length - 1
          ? siblings[index + 1]
          : null,
      coins: access.coins,
      isLoggedIn: Boolean(userId),
    });
  } catch (error) {
    console.error("Failed to fetch chapter:", error);

    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chapters/:id
 *
 * Admin only. Updates a chapter, or moves it with { move: "up" | "down" }.
 */
export async function PATCH(
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
    const body = await req.json();

    const existing = await prisma.chapter.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    if (body.move === "up" || body.move === "down") {
      await renumberChapters(existing.storyId);

      const current = await prisma.chapter.findUniqueOrThrow({
        where: { id },
        select: { number: true },
      });

      const neighbour = await prisma.chapter.findFirst({
        where: {
          storyId: existing.storyId,
          number:
            body.move === "up"
              ? current.number - 1
              : current.number + 1,
        },
        select: { id: true, number: true },
      });

      if (neighbour) {
        await prisma.$transaction([
          prisma.chapter.update({
            where: { id: neighbour.id },
            data: { number: current.number },
          }),
          prisma.chapter.update({
            where: { id },
            data: { number: neighbour.number },
          }),
        ]);
      }

      return NextResponse.json({ message: "Chapter moved" });
    }

    const { title, content, isFree, price, isPublished } = body;

    if (content !== undefined && content?.type !== "doc") {
      return NextResponse.json(
        { error: "Invalid chapter content" },
        { status: 400 }
      );
    }

    const chapter = await prisma.chapter.update({
      where: { id },
      data: {
        ...(title !== undefined
          ? { title: String(title).trim() || existing.title }
          : {}),
        ...(content !== undefined ? { content } : {}),
        ...(typeof isFree === "boolean" ? { isFree } : {}),
        ...(price !== undefined
          ? {
              price: Math.max(
                0,
                Math.round(Number(price) || 0)
              ),
            }
          : {}),
        ...(typeof isPublished === "boolean"
          ? { isPublished }
          : {}),
      },
    });

    return NextResponse.json({
      message: "Chapter updated",
      chapter,
    });
  } catch (error) {
    console.error("Failed to update chapter:", error);

    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chapters/:id
 *
 * Admin only. A story must keep at least one chapter.
 */
export async function DELETE(
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
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      select: { storyId: true },
    });

    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    const count = await prisma.chapter.count({
      where: { storyId: chapter.storyId },
    });

    if (count <= 1) {
      return NextResponse.json(
        {
          error:
            "A story needs at least one chapter. Delete the story instead.",
        },
        { status: 400 }
      );
    }

    await prisma.chapter.delete({ where: { id } });
    await renumberChapters(chapter.storyId);

    return NextResponse.json({ message: "Chapter deleted" });
  } catch (error) {
    console.error("Failed to delete chapter:", error);

    return NextResponse.json(
      { error: "Failed to delete chapter" },
      { status: 500 }
    );
  }
}
