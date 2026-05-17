import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
  const user = getUserFromToken(req);
  const userId = user?.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { comicId } = await req.json();

  const comic = await prisma.comic.findUnique({
    where: { id: comicId },
  });

  if (!comic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: comic.title,
          },
          unit_amount: Math.round(comic.price * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/comics`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/comics`,
    metadata: {
  userId: String(userId),
  comicId: String(comicId),
},
  });

  return NextResponse.json({ url: session.url });
} catch (err) {
    console.error("STRIPE ERROR:", err);

    return NextResponse.json(
      { error: "Stripe failed" },
      { status: 500 }
    );
  }
}