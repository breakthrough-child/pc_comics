import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { comicId, title } = await req.json();

    if (!comicId) {
      return NextResponse.json({ error: "Missing comicId" }, { status: 400 });
    }

    const subscribers = await prisma.newsletter.findMany();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const previewLink = `${process.env.NEXT_PUBLIC_BASE_URL}/comics?preview=${comicId}`;

    for (const sub of subscribers) {
      await transporter.sendMail({
        from: `"Comic Platform" <${process.env.EMAIL_USER}>`,
        to: sub.email,
        subject: `🔥 New Comic Released: ${title}`,
        html: `
          <h2>New Comic Drop!</h2>
          <p>Check out our latest release:</p>
          <a href="${previewLink}">👉 Preview Comic</a>
        `,
      });
    }

    return NextResponse.json({ message: "Emails sent" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}