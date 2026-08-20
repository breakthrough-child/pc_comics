import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

export const runtime = "nodejs";

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

    const { comicId } = await req.json();

    if (!comicId) {
      return NextResponse.json(
        { error: "Comic ID is required" },
        { status: 400 }
      );
    }

    // Find the comic
    const comic = await prisma.comic.findUnique({
      where: { id: comicId },
    });

    if (!comic) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    // Find the authenticated user's email
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

    // Paystack requires the amount in the smallest
    // currency unit (kobo for NGN).
    const amount = Math.round(comic.price * 100);

    // Unique transaction reference
    const reference = `comic_${comicId}_${userId}_${Date.now()}`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: dbUser.email,
          amount,
          currency: "NGN",
          reference,

          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/paystack/callback`,

          metadata: {
            userId: String(userId),
            comicId: String(comicId),
          },
        }),
      }
    );

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status) {
      console.error("PAYSTACK INITIALIZATION ERROR:", data);

      return NextResponse.json(
        {
          error:
            data.message ||
            "Unable to initialize Paystack payment",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (err) {
    console.error("PAYSTACK ERROR:", err);

    return NextResponse.json(
      { error: "Paystack payment failed" },
      { status: 500 }
    );
  }
}