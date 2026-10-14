import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { parsePackage } from "@/lib/coins";

/**
 * PATCH /api/admin/coin-packages/:id
 * Admin only. Updates a coin package.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromToken(req);
  const { id } = await params;

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = parsePackage(await req.json());

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const coinPackage = await prisma.coinPackage.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ message: "Package updated", coinPackage });
  } catch {
    return NextResponse.json(
      { error: "Package not found" },
      { status: 404 }
    );
  }
}

/**
 * DELETE /api/admin/coin-packages/:id
 * Admin only. Past purchases are kept in the coin history.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromToken(req);
  const { id } = await params;

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.coinPackage.delete({ where: { id } });
    return NextResponse.json({ message: "Package deleted" });
  } catch {
    return NextResponse.json(
      { error: "Package not found" },
      { status: 404 }
    );
  }
}
