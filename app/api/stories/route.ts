import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { buildPreviewContent } from "@/lib/chapters";

/**
 * GET /api/stories
 *
 * Admins can see all stories.
 * Regular users can only see published stories.
 *
 * Chapter content is never sent here. Each story only carries a short,
 * text-only preview of its first chapter for the preview modal.
 */
export async function GET(req: Request) {
  const user = getUserFromToken(req);
  const role = user?.role;
  const isAdmin = role === "ADMIN";

  try {
    const stories = await prisma.story.findMany({
      where: isAdmin ? {} : { isPublished: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
        isPublished: true,
        chapters: {
          where: isAdmin ? {} : { isPublished: true },
          orderBy: { number: "asc" },
          select: {
            id: true,
            number: true,
            isFree: true,
            price: true,
            content: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
    });

    const formatted = stories.map((story) => {
      const firstChapter = story.chapters[0];
      const ratings = story.reviews.map((r) => r.rating);

      return {
        id: story.id,
        title: story.title,
        subtitle: story.subtitle,
        description: story.description,
        coverImage: story.coverImage,
        isPublished: story.isPublished,
        updatedAt: story.updatedAt,
        chapterCount: story.chapters.length,
        freeChapterCount: story.chapters.filter(
          (c) => c.isFree || c.price <= 0
        ).length,
        firstChapterId: firstChapter?.id || null,
        previewContent: firstChapter
          ? buildPreviewContent(firstChapter.content)
          : null,
        avgRating: ratings.length
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch stories:", error);

    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stories
 *
 * Admin only.
 * Creates a new book together with its first chapter.
 */
export async function POST(req: Request) {
  const user = getUserFromToken(req);
  const userId = user?.userId;
  const role = user?.role;

  if (!userId || role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admins only" },
      { status: 403 }
    );
  }

  try {
    const {
      title,
      subtitle,
      description,
      coverImage,
      isPublished,
      chapter,
    } = await req.json();

    if (!title || !chapter?.content) {
      return NextResponse.json(
        { error: "Title and first chapter content are required" },
        { status: 400 }
      );
    }

    const price = Math.max(0, Math.round(Number(chapter.price) || 0));

    const story = await prisma.story.create({
      data: {
        title,
        subtitle: subtitle ?? null,
        description: description ?? null,
        coverImage: coverImage ?? null,
        isPublished: Boolean(isPublished),
        chapters: {
          create: {
            number: 1,
            title: chapter.title?.trim() || "Chapter 1",
            content: chapter.content,
            isFree: chapter.isFree !== false,
            price,
            isPublished: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Story created",
      story,
    });
  } catch (error) {
    console.error("Failed to create story:", error);

    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}
