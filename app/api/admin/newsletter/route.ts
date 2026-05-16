import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(req: Request) {
  const user = getUserFromToken(req);

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const subscribers = await prisma.newsletter.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(subscribers);
}