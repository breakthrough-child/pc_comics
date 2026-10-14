import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type PaystackTransaction = {
  reference: string;
  status: string;
  amount: number;
  metadata?: Record<string, any> | null;
};

/**
 * Verifies a transaction directly with Paystack.
 * Returns the verified transaction, or null if it could not be verified.
 */
export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackTransaction | null> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error("❌ PAYSTACK_SECRET_KEY is missing");
    return null;
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(
      reference
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.status) {
    console.error("❌ Paystack verification failed:", data);
    return null;
  }

  return data.data as PaystackTransaction;
}

export type CreditResult =
  | { ok: true; coins: number; alreadyCredited: boolean }
  | { ok: false; error: string };

/**
 * Credits the coins bought in a verified Paystack transaction.
 *
 * Safe to call more than once for the same transaction (the callback and
 * the webhook both call it): the unique CoinTransaction.reference makes
 * sure the coins are only added once.
 */
export async function creditCoinPurchase(
  transaction: PaystackTransaction
): Promise<CreditResult> {
  if (transaction.status !== "success") {
    return { ok: false, error: "Payment was not successful" };
  }

  const metadata = transaction.metadata || {};

  if (metadata.type !== "coins") {
    return { ok: false, error: "Not a coin purchase" };
  }

  const userId = metadata.userId ? String(metadata.userId) : "";
  const coins = Number(metadata.coins);
  const expectedAmount = Number(metadata.expectedAmount);

  if (!userId || !Number.isInteger(coins) || coins <= 0) {
    return { ok: false, error: "Invalid coin purchase metadata" };
  }

  // The amount actually paid must match what the checkout asked for.
  if (!expectedAmount || transaction.amount < expectedAmount) {
    console.error("❌ Coin purchase amount mismatch", {
      paid: transaction.amount,
      expectedAmount,
    });

    return { ok: false, error: "Payment amount mismatch" };
  }

  try {
    await prisma.$transaction([
      prisma.coinTransaction.create({
        data: {
          userId,
          type: "PURCHASE",
          coins,
          amountNaira: transaction.amount / 100,
          reference: transaction.reference,
          description: metadata.packageName
            ? `Bought ${metadata.packageName}`
            : `Bought ${coins} coins`,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: coins } },
      }),
    ]);

    console.log("🪙 COINS CREDITED:", {
      userId,
      coins,
      reference: transaction.reference,
    });

    return { ok: true, coins, alreadyCredited: false };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: true, coins, alreadyCredited: true };
    }

    throw error;
  }
}

/**
 * Validates an admin coin package form.
 */
export function parsePackage(body: any) {
  const name = String(body.name || "").trim();
  const coins = Math.round(Number(body.coins));
  const priceNaira = Number(body.priceNaira);

  if (!name) return { error: "Enter a package name" };

  if (!Number.isInteger(coins) || coins <= 0) {
    return { error: "Coins must be a whole number above 0" };
  }

  if (!Number.isFinite(priceNaira) || priceNaira < 50) {
    return { error: "Price must be at least ₦50" };
  }

  return {
    data: {
      name,
      coins,
      priceNaira,
      isActive: body.isActive !== false,
      sortOrder: Math.round(Number(body.sortOrder) || 0),
    },
  };
}
