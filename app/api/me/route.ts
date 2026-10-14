import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = getUserFromToken(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wallet = await prisma.user
    .findUnique({
      where: { id: user.userId },
      select: { coins: true },
    })
    .catch(() => null);

  return NextResponse.json({ ...user, coins: wallet?.coins ?? 0 });
}
