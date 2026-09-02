import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

/**
 * GET /api/stories
 *
 * Admins can see all stories.
 * Regular users can only see published stories.
 */
export async function GET(req: Request) {
  const user = getUserFromToken(req);
  const userId = user?.userId || null;
  const role = user?.role;

  try {
    const stories = await prisma.story.findMany({
      where:
        role === "ADMIN"
          ? {}
          : {
              isPublished: true,
            },

      orderBy: {
        createdAt: "desc",
      },

      select: {
  id: true,
  title: true,
  subtitle: true,
  description: true,
  coverImage: true,
  price: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  isPublished: true,

  purchases: userId
    ? {
        where: { userId },
        select: { id: true },
      }
    : false,
},
    });

    const formatted = stories.map((story: any) => ({
  id: story.id,
  title: story.title,
  subtitle: story.subtitle,
  description: story.description,
  coverImage: story.coverImage,
  price: story.price,
  content: story.content,
  isPublished: story.isPublished,
  purchased: userId
    ? story.purchases.length > 0
    : false,
}));

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
 * Creates a new unpublished story.
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
      price,
      content,
      isPublished,
    } = await req.json();

    if (!title || !content || price === undefined || price === null || price === "") {
      return NextResponse.json(
        { error: "Title, price and content are required" },
        { status: 400 }
      );
    }

    const story = await prisma.story.create({
      data: {
        title,
        subtitle: subtitle ?? null,
        description: description ?? null,
        coverImage: coverImage ?? null,
        price: Number(price) || 0,
        content,
        isPublished: Boolean(isPublished),
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