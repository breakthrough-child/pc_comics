import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

/**
 * PATCH /api/admin/site-settings
 * Admin only. Body: { showReaderCount?, readerCountLabel? }
 */
export async function PATCH(req: Request) {
  const user = getUserFromToken(req);

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { showReaderCount, readerCountLabel } = await req.json();

  const label =
    typeof readerCountLabel === "string"
      ? readerCountLabel.trim().slice(0, 40) || "readers"
      : undefined;

  const data = {
    ...(typeof showReaderCount === "boolean" ? { showReaderCount } : {}),
    ...(label !== undefined ? { readerCountLabel: label } : {}),
  };

  const settings = await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: data,
    create: { id: "site", ...data },
  });

  return NextResponse.json({ message: "Settings saved", settings });
}
