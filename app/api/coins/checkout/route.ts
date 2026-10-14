import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

/**
 * POST /api/coins/checkout
 *
 * Starts a Paystack card payment for a coin package.
 * Body: { packageId, returnTo? }
 */
export async function POST(req: Request) {
  try {
    const user = getUserFromToken(req);
    const userId = user?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { packageId, returnTo } = await req.json();

    const coinPackage = packageId
      ? await prisma.coinPackage.findUnique({
          where: { id: packageId },
        })
      : null;

    if (!coinPackage || !coinPackage.isActive) {
      return NextResponse.json(
        { error: "Coin package not found" },
        { status: 404 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!dbUser?.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!secretKey || !baseUrl) {
      console.error(
        "❌ PAYSTACK_SECRET_KEY or NEXT_PUBLIC_APP_URL is missing"
      );

      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    // Paystack expects kobo: ₦500 → 50000
    const amount = Math.round(coinPackage.priceNaira * 100);

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Invalid package price" },
        { status: 400 }
      );
    }

    // Only allow returning to a page on this site.
    const safeReturnTo =
      typeof returnTo === "string" &&
      returnTo.startsWith("/") &&
      !returnTo.startsWith("//")
        ? returnTo
        : "/coins";

    const callbackUrl = new URL(
      "/api/paystack/coins-callback",
      baseUrl
    );
    callbackUrl.searchParams.set("returnTo", safeReturnTo);

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: dbUser.email,
          amount,
          currency: "NGN",
          channels: ["card"],
          callback_url: callbackUrl.toString(),
          metadata: {
            type: "coins",
            userId: String(userId),
            packageId: coinPackage.id,
            packageName: coinPackage.name,
            coins: coinPackage.coins,
            expectedAmount: amount,
          },
        }),
      }
    );

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status) {
      console.error("❌ PAYSTACK COIN CHECKOUT ERROR:", data);

      return NextResponse.json(
        { error: data.message || "Paystack checkout failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error("❌ COIN CHECKOUT ERROR:", error);

    return NextResponse.json(
      { error: "Coin checkout failed" },
      { status: 500 }
    );
  }
}
