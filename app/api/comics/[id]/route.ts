import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

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

  const { title, description, price, imageUrl, pages } = await req.json();

  const updated = await prisma.comic.update({
    where: { id, },
    data: {
    title,
    description,
    price,
    imageUrl,
    ...(Array.isArray(pages) && { pages }),
    },
  });

  return NextResponse.json({
    message: "Comic updated",
    comic: updated,
  });
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
    await prisma.comic.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Comic deleted",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete comic" },
      { status: 500 }
    );
  }
}