import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

/**
 * GET /api/coins
 *
 * Active coin packages for everyone, plus the balance and recent
 * coin history for logged-in users.
 */
export async function GET(req: Request) {
  const user = getUserFromToken(req);
  const userId = user?.userId || null;

  try {
    const [packages, wallet, transactions] = await Promise.all([
      prisma.coinPackage.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { priceNaira: "asc" }],
        select: {
          id: true,
          name: true,
          coins: true,
          priceNaira: true,
        },
      }),
      userId
        ? prisma.user.findUnique({
            where: { id: userId },
            select: { coins: true },
          })
        : null,
      userId
        ? prisma.coinTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
              id: true,
              type: true,
              coins: true,
              amountNaira: true,
              description: true,
              createdAt: true,
            },
          })
        : [],
    ]);

    return NextResponse.json({
      isLoggedIn: Boolean(userId),
      balance: wallet?.coins ?? 0,
      packages,
      transactions,
    });
  } catch (error) {
    console.error("Failed to load coins:", error);

    return NextResponse.json(
      { error: "Failed to load coins" },
      { status: 500 }
    );
  }
}
