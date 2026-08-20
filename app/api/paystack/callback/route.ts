import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/comics?payment=failed`
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("❌ PAYSTACK_SECRET_KEY is missing");

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/comics?payment=error`
      );
    }

    // Verify transaction directly with Paystack
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

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/comics?payment=failed`
      );
    }

    const transaction = data.data;

    if (transaction.status !== "success") {
      console.log("⚠️ Payment was not successful:", transaction.status);

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/comics?payment=failed`
      );
    }

    console.log("✅ PAYSTACK CALLBACK PAYMENT VERIFIED");

    /*
     * The webhook is responsible for creating the Purchase.
     *
     * We intentionally do NOT create the purchase here.
     * This prevents the browser callback from being the
     * source of truth for payment fulfillment.
     */

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/comics?payment=success`
    );
  } catch (error) {
    console.error("❌ PAYSTACK CALLBACK ERROR:", error);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/comics?payment=error`
    );
  }
}