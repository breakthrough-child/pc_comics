import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
    const sig = headerList.get("stripe-signature");

    if (!sig) {
    return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
    );
    }
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ✅ HANDLE PAYMENT SUCCESS
  if (event.type === "checkout.session.completed") {

    
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const comicId = session.metadata?.comicId;

    if (!userId || !comicId) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    try {
      const existing = await prisma.purchase.findUnique({
  where: {
    userId_comicId: {
      userId,
      comicId,
    },
  },
});

if (!existing) {
  await prisma.purchase.create({
    data: {
      userId,
      comicId,
    },
  });
}
    } catch (err) {
      console.error("DB error:", err);
    }

    console.log("WEBHOOK HIT ✅");
    console.log("SESSION:", session);
  }

  return NextResponse.json({ received: true });
}