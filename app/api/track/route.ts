import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { classifySource, isBot, isTrackablePath } from "@/lib/analytics";

/**
 * POST /api/track
 *
 * Records one page visit. Body: { visitorId, path, referrer?, utmSource? }
 * Bots and the admin's own visits are ignored.
 */
export async function POST(req: Request) {
  try {
    if (isBot(req.headers.get("user-agent"))) {
      return new NextResponse(null, { status: 204 });
    }

    const user = getUserFromToken(req);

    if (user?.role === "ADMIN") {
      return new NextResponse(null, { status: 204 });
    }

    const { visitorId, path, referrer, utmSource } = await req.json();

    if (
      typeof visitorId !== "string" ||
      !/^[A-Za-z0-9-]{8,64}$/.test(visitorId) ||
      typeof path !== "string" ||
      !isTrackablePath(path)
    ) {
      return new NextResponse(null, { status: 204 });
    }

    const ownHost = new URL(req.url).hostname.toLowerCase();
    const cleanReferrer =
      typeof referrer === "string" && referrer ? referrer.slice(0, 500) : null;

    await prisma.pageView.create({
      data: {
        visitorId,
        path,
        source: classifySource(
          typeof utmSource === "string" ? utmSource : null,
          cleanReferrer,
          ownHost
        ),
        referrer: cleanReferrer,
        userId: user?.userId ?? null,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Tracking must never break the site.
    console.error("TRACK ERROR:", error);
    return new NextResponse(null, { status: 204 });
  }
}
