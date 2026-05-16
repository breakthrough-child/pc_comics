import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(req: Request) {

const user = getUserFromToken(req);
const userId = user?.userId || null;

    try {
    const comics = await prisma.comic.findMany({
      orderBy: {
        createdAt: "desc",
      },
select: {
  id: true,
  title: true,
  description: true,
  price: true,
  imageUrl: true,
  pages: true,
  previewPages: true,

  purchases: userId
    ? {
        where: { userId },
        select: { id: true },
      }
    : false,

  reviews: {
    select: {
      rating: true,
    },
  },
},
    });

    const formatted = comics.map((comic) => {
  const avgRating =
    comic.reviews.length > 0
      ? comic.reviews.reduce((a, r) => a + r.rating, 0) /
        comic.reviews.length
      : 0;

  return {
  id: comic.id,
  title: comic.title,
  description: comic.description,
  price: comic.price,
  imageUrl: comic.imageUrl,
  purchased: userId ? comic.purchases.length > 0 : false,
  avgRating,

  pages: comic.pages ?? [],
  previewPages:
  comic.previewPages ??
  (Array.isArray(comic.pages) ? comic.pages.slice(0, 3) : []),
};
});

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch comics" },
      { status: 500 }
    );
  }
}

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
    const { title, description, price, imageUrl, pages, previewPages } =
      await req.json();

if (
  !title ||
  !description ||
  !price ||
  !imageUrl ||
  !pages ||
  pages.length === 0
) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(pages)) {
  return NextResponse.json(
    { error: "Pages must be an array" },
    { status: 400 }
  );
}

    const comic = await prisma.comic.create({
      data: {
        title,
        description,
        price,
        imageUrl,
        pages,
        previewPages: previewPages ?? pages.slice(0, 3),
      },
    });

    return NextResponse.json({
      message: "Comic created",
      comic,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create comic" },
      { status: 500 }
    );
  }
}