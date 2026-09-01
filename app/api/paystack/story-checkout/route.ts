import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

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

    const { storyId } = await req.json();

    if (!storyId) {
      return NextResponse.json(
        { error: "Story ID is required" },
        { status: 400 }
      );
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

        // Find the authenticated user's email from the database.
    // Do not rely on the JWT payload for the email because
    // the token may only contain the userId.
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
      },
    });

    if (!dbUser?.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Check whether the user already owns the story.
    const existingPurchase =
      await prisma.storyPurchase.findUnique({
        where: {
          userId_storyId: {
            userId,
            storyId,
          },
        },
      });

    if (existingPurchase) {
      return NextResponse.json(
        {
          error: "You already purchased this story",
        },
        { status: 400 }
      );
    }

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error(
        "❌ PAYSTACK_SECRET_KEY is missing"
      );

      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    /*
     * Paystack expects the amount in the smallest
     * currency unit.
     *
     * Example:
     * ₦2,000 → 200000 kobo
     */
    const amount = Math.round(story.price * 100);

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Invalid story price" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl) {
      console.error(
        "❌ NEXT_PUBLIC_APP_URL is missing"
      );

      return NextResponse.json(
        { error: "Application URL is not configured" },
        { status: 500 }
      );
    }

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

          callback_url:
            `${baseUrl}/api/paystack/story-callback`,

          metadata: {
            type: "story",
            userId: String(userId),
            storyId: String(story.id),
          },
        }),
      }
    );

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status) {
      console.error(
        "❌ PAYSTACK STORY CHECKOUT ERROR:",
        data
      );

      return NextResponse.json(
        {
          error:
            data.message ||
            "Paystack checkout failed",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error(
      "❌ STORY CHECKOUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Story checkout failed",
      },
      { status: 500 }
    );
  }
}