import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromToken(req);
  const userId = user?.userId || null;
  const role = user?.role;
  const { id } = await params;

  try {
    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    // Admins can always load a story for editing.
    if (role === "ADMIN") {
  return NextResponse.json({
    story: {
      ...story,
      content: story.content,
      purchased: true,
    },
  });
}

    // Unpublished stories are not available to regular users.
    if (!story.isPublished) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    // Published stories can be viewed by users who purchased them.
    const purchased = userId
      ? await prisma.storyPurchase.findUnique({
          where: {
            userId_storyId: {
              userId,
              storyId: id,
            },
          },
        })
      : null;

    return NextResponse.json({
      story: {
        ...story,
        content: purchased ? story.content : null,
        purchased: Boolean(purchased),
      },
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
      price,
      content,
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
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(content !== undefined ? { content } : {}),
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

    await prisma.story.delete({
      where: { id },
    });

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