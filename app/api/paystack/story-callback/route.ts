import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl) {
      console.error(
        "❌ NEXT_PUBLIC_APP_URL is missing"
      );

      return NextResponse.redirect(
        new URL("/stories?payment=error", req.url)
      );
    }

    if (!reference) {
      console.error(
        "❌ Missing Paystack story transaction reference"
      );

      return NextResponse.redirect(
        `${baseUrl}/stories?payment=failed`
      );
    }

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error(
        "❌ PAYSTACK_SECRET_KEY is missing"
      );

      return NextResponse.redirect(
        `${baseUrl}/stories?payment=error`
      );
    }

    // Verify the transaction directly with Paystack.
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
      console.error(
        "❌ Paystack story verification failed:",
        data
      );

      return NextResponse.redirect(
        `${baseUrl}/stories?payment=failed`
      );
    }

    const transaction = data.data;

    if (transaction.status !== "success") {
      console.log(
        "⚠️ Story payment was not successful:",
        transaction.status
      );

      return NextResponse.redirect(
        `${baseUrl}/stories?payment=failed`
      );
    }

    // Confirm this transaction belongs to the story payment flow.
    if (transaction.metadata?.type !== "story") {
      console.error(
        "❌ Paystack transaction is not a story payment"
      );

      return NextResponse.redirect(
        `${baseUrl}/stories?payment=failed`
      );
    }

    const storyId = transaction.metadata?.storyId;

    if (!storyId) {
      console.error(
        "❌ Story ID missing from Paystack transaction metadata"
      );

      return NextResponse.redirect(
        `${baseUrl}/stories?payment=failed`
      );
    }

    console.log(
      "✅ PAYSTACK STORY PAYMENT VERIFIED:",
      {
        reference: transaction.reference,
        storyId,
        userId: transaction.metadata?.userId,
      }
    );

    /*
     * The Paystack webhook is responsible for creating
     * the StoryPurchase.
     *
     * This callback only verifies the payment and sends
     * the customer back to the story.
     */
    return NextResponse.redirect(
      `${baseUrl}/stories/${encodeURIComponent(
        String(storyId)
      )}?payment=success`
    );
  } catch (error) {
    console.error(
      "❌ PAYSTACK STORY CALLBACK ERROR:",
      error
    );

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL;

    if (baseUrl) {
      return NextResponse.redirect(
        `${baseUrl}/stories?payment=error`
      );
    }

    return NextResponse.json(
      {
        error: "Story payment callback failed",
      },
      { status: 500 }
    );
  }
}