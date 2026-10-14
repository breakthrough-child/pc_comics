import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { canReadChapter, getReaderAccess } from "@/lib/chapters";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromToken(req);
  const userId = user?.userId || null;
  const isAdmin = user?.role === "ADMIN";
  const { id } = await params;

  try {
    const story = await prisma.story.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        coverImage: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        chapters: {
          where: isAdmin ? {} : { isPublished: true },
          orderBy: { number: "asc" },
          select: {
            id: true,
            number: true,
            title: true,
            isFree: true,
            price: true,
            isPublished: true,
            updatedAt: true,
          },
        },
      },
    });

    // Unpublished stories are only visible to admins.
    if (!story || (!story.isPublished && !isAdmin)) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    const access = await getReaderAccess(id, userId);

    const chapters = story.chapters.map((chapter) => ({
      ...chapter,
      isFree: chapter.isFree || chapter.price <= 0,
      unlocked:
        access.ownsStory || access.unlockedIds.has(chapter.id),
      canRead: canReadChapter(chapter, access, isAdmin),
    }));

    return NextResponse.json({
      story: {
        ...story,
        chapters,
        ownsStory: access.ownsStory,
      },
      coins: access.coins,
      isLoggedIn: Boolean(userId),
    });
  } catch (error) {
    console.error("Failed to fetch story:", error);

    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromToken(req);
  const userId = user?.userId;
  const role = user?.role;
  const { id } = await params;

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
      sendNewsletter,
    } = await req.json();

    const existingStory = await prisma.story.findUnique({
      where: { id },
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.story.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(subtitle !== undefined ? { subtitle } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(coverImage !== undefined ? { coverImage } : {}),
        ...(typeof isPublished === "boolean"
          ? { isPublished }
          : {}),
      },
    });

    const isBeingPublished =
  !existingStory.isPublished &&
  isPublished === true;

if (isBeingPublished && sendNewsletter === true) {
  try {
    const newsletterUrl = new URL(
      "/api/newsletter/send",
      req.url
    );

    await fetch(newsletterUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storyId: updated.id,
        title: updated.title,
      }),
    });
  } catch (newsletterError) {
    console.error(
      "STORY NEWSLETTER ERROR:",
      newsletterError
    );
  }
}

    return NextResponse.json({
      message: "Story updated",
      story: updated,
    });
  } catch (error) {
    console.error("Failed to update story:", error);

    return NextResponse.json(
      { error: "Failed to update story" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromToken(req);
  const userId = user?.userId;
  const role = user?.role;
  const { id } = await params;

  if (!userId || role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admins only" },
      { status: 403 }
    );
  }

  try {
    const existingStory = await prisma.story.findUnique({
      where: { id },
    });

    if (!existingStory) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    // Remove everything attached to the story. Chapters and their
    // unlocks are removed by the database cascade.
    await prisma.$transaction([
      prisma.like.deleteMany({
        where: { comment: { storyId: id } },
      }),
      prisma.comment.updateMany({
        where: { storyId: id },
        data: { parentId: null },
      }),
      prisma.comment.deleteMany({ where: { storyId: id } }),
      prisma.review.deleteMany({ where: { storyId: id } }),
      prisma.storyPurchase.deleteMany({ where: { storyId: id } }),
      prisma.story.delete({ where: { id } }),
    ]);

    return NextResponse.json({
      message: "Story deleted",
    });
  } catch (error) {
    console.error("Failed to delete story:", error);

    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    );
  }
}