import { NextResponse } from "next/server";
import {
  creditCoinPurchase,
  verifyPaystackTransaction,
} from "@/lib/coins";

/**
 * GET /api/paystack/coins-callback
 *
 * Paystack sends the buyer here after paying. The payment is verified
 * and the coins are credited straight away, so the buyer does not have
 * to wait for the webhook. The webhook credits too, but a payment is
 * never credited twice.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference =
    searchParams.get("reference") || searchParams.get("trxref");
  const returnTo = searchParams.get("returnTo") || "/coins";

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  const safeReturnTo =
    returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : "/coins";

  function redirectWith(status: string, coins?: number) {
    const url = new URL(safeReturnTo, baseUrl);
    url.searchParams.set("coins", status);

    if (coins) {
      url.searchParams.set("added", String(coins));
    }

    return NextResponse.redirect(url);
  }

  try {
    if (!reference) {
      return redirectWith("failed");
    }

    const transaction = await verifyPaystackTransaction(reference);

    if (!transaction) {
      return redirectWith("failed");
    }

    const result = await creditCoinPurchase(transaction);

    if (!result.ok) {
      console.error("❌ COIN CALLBACK:", result.error);
      return redirectWith("failed");
    }

    return redirectWith("success", result.coins);
  } catch (error) {
    console.error("❌ PAYSTACK COINS CALLBACK ERROR:", error);
    return redirectWith("error");
  }
}
