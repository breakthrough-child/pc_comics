import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.text();

    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      console.error("❌ Missing Paystack signature");

      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("❌ PAYSTACK_SECRET_KEY is missing");

      return NextResponse.json(
        { error: "Paystack configuration error" },
        { status: 500 }
      );
    }

    // Verify that the webhook actually came from Paystack
    const expectedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(body)
      .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      console.error("❌ Invalid Paystack webhook signature");

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    console.log("✅ PAYSTACK WEBHOOK RECEIVED:", event.event);

    // Only process successful charges
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const transaction = event.data;

    console.log("PAYSTACK TRANSACTION:", {
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
      metadata: transaction.metadata,
    });

    // Paystack should only grant access for successful payments
    if (transaction.status !== "success") {
      console.log("⚠️ Transaction was not successful");
      return NextResponse.json({ received: true });
    }

    const userId = transaction.metadata?.userId;
    const comicId = transaction.metadata?.comicId;

    if (!userId || !comicId) {
      console.error("❌ Missing Paystack metadata", {
        userId,
        comicId,
      });

      return NextResponse.json(
        { error: "Missing metadata" },
        { status: 400 }
      );
    }

    // Verify the transaction directly with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        transaction.reference
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

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.status) {
      console.error("❌ Paystack transaction verification failed", verifyData);

      return NextResponse.json(
        { error: "Transaction verification failed" },
        { status: 400 }
      );
    }

    const verifiedTransaction = verifyData.data;

    if (verifiedTransaction.status !== "success") {
      console.error("❌ Verified transaction is not successful");

      return NextResponse.json(
        { error: "Payment was not successful" },
        { status: 400 }
      );
    }

    console.log("✅ PAYSTACK PAYMENT VERIFIED");

    // Prevent duplicate purchases
    const existing = await prisma.purchase.findUnique({
      where: {
        userId_comicId: {
          userId: String(userId),
          comicId: String(comicId),
        },
      },
    });

    if (existing) {
      console.log("ℹ️ Purchase already exists:", existing.id);

      return NextResponse.json({
        received: true,
        alreadyPurchased: true,
      });
    }

    // Create the purchase
    const purchase = await prisma.purchase.create({
      data: {
        userId: String(userId),
        comicId: String(comicId),
      },
    });

    console.log("🎉 PURCHASE CREATED:", purchase);

    return NextResponse.json({
      received: true,
      purchaseCreated: true,
    });
  } catch (error) {
    console.error("❌ PAYSTACK WEBHOOK ERROR:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}