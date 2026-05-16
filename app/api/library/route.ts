import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(req: Request) {
  const decoded = getUserFromToken(req);
  const userId = decoded?.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const purchases = await prisma.purchase.findMany({
    where: { userId },
    include: {
      comic: true,
    },
  });

  return NextResponse.json(
    purchases.map((p) => p.comic)
  );
}