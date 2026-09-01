import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { comicId, storyId, title } = await req.json();

    if (!comicId && !storyId) {
      return NextResponse.json(
        { error: "Missing comicId or storyId" },
        { status: 400 }
      );
    }

    const subscribers = await prisma.newsletter.findMany();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const isStory = Boolean(storyId);

    const contentLink = isStory
      ? `${baseUrl}/stories/${storyId}`
      : `${baseUrl}/comics?preview=${comicId}`;

    const subject = isStory
      ? `📖 New Story Published: ${title}`
      : `🔥 New Comic Released: ${title}`;

    const heading = isStory
      ? "New Story Published!"
      : "New Comic Drop!";

    const linkText = isStory
      ? "👉 Read Story"
      : "👉 Preview Comic";

    for (const sub of subscribers) {
      await transporter.sendMail({
        from: `"Comic Platform" <${process.env.EMAIL_USER}>`,
        to: sub.email,
        subject,
        html: `
          <h2>${heading}</h2>

          <p>Check out our latest release:</p>

          <a href="${contentLink}">
            ${linkText}
          </a>
        `,
      });
    }

    return NextResponse.json({
      message: "Emails sent",
    });
  } catch (err) {
    console.error("NEWSLETTER SEND ERROR:", err);

    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}