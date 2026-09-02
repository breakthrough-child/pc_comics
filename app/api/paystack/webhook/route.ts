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
      console.error(
        "❌ Paystack transaction verification failed",
        verifyData
      );

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

    /*
     * STORY PAYMENT
     *
     * Story checkout sends:
     *
     * metadata: {
     *   type: "story",
     *   userId,
     *   storyId
     * }
     *
     * Story purchases are stored separately from comic purchases.
     */
    if (verifiedTransaction.metadata?.type === "story") {
      const userId = verifiedTransaction.metadata?.userId;
      const storyId = verifiedTransaction.metadata?.storyId;

      if (!userId || !storyId) {
        console.error("❌ Missing story Paystack metadata", {
          userId,
          storyId,
        });

        return NextResponse.json(
          { error: "Missing story metadata" },
          { status: 400 }
        );
      }

      // Make sure the story exists before granting access.
      const story = await prisma.story.findUnique({
        where: {
          id: String(storyId),
        },
      });

      if (!story) {
        console.error("❌ Story not found for Paystack payment:", storyId);

        return NextResponse.json(
          { error: "Story not found" },
          { status: 404 }
        );
      }

      // Prevent duplicate story purchases.
      const existingStoryPurchase =
        await prisma.storyPurchase.findUnique({
          where: {
            userId_storyId: {
              userId: String(userId),
              storyId: String(storyId),
            },
          },
        });

      if (existingStoryPurchase) {
        console.log(
          "ℹ️ Story purchase already exists:",
          existingStoryPurchase.id
        );

        return NextResponse.json({
          received: true,
          alreadyPurchased: true,
          storyPurchase: true,
        });
      }

      // Create the story purchase.
      const storyPurchase =
        await prisma.storyPurchase.create({
          data: {
            userId: String(userId),
            storyId: String(storyId),
          },
        });

      console.log(
        "🎉 STORY PURCHASE CREATED:",
        storyPurchase
      );

      return NextResponse.json({
        received: true,
        purchaseCreated: true,
        storyPurchase: true,
      });
    }

    /*
     * COMIC PAYMENT
     *
     * Existing comic purchase flow remains unchanged.
     */
    const userId = verifiedTransaction.metadata?.userId;
    const comicId = verifiedTransaction.metadata?.comicId;

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