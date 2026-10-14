import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { parsePackage } from "@/lib/coins";


/**
 * GET /api/admin/coin-packages
 * Admin only. Every package, including inactive ones.
 */
export async function GET(req: Request) {
  const user = getUserFromToken(req);

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const packages = await prisma.coinPackage.findMany({
    orderBy: [{ sortOrder: "asc" }, { priceNaira: "asc" }],
  });

  const [sold, spent] = await Promise.all([
    prisma.coinTransaction.aggregate({
      where: { type: "PURCHASE" },
      _sum: { coins: true, amountNaira: true },
    }),
    prisma.coinTransaction.aggregate({
      where: { type: "UNLOCK" },
      _sum: { coins: true },
    }),
  ]);

  return NextResponse.json({
    packages,
    stats: {
      coinsSold: sold._sum.coins || 0,
      revenueNaira: sold._sum.amountNaira || 0,
      coinsSpent: Math.abs(spent._sum.coins || 0),
    },
  });
}

/**
 * POST /api/admin/coin-packages
 * Admin only. Creates a coin package.
 */
export async function POST(req: Request) {
  const user = getUserFromToken(req);

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = parsePackage(await req.json());

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const coinPackage = await prisma.coinPackage.create({
    data: parsed.data,
  });

  return NextResponse.json({ message: "Package created", coinPackage });
}
