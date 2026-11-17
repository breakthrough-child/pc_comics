import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/getUserFromToken";
import {
  LAGOS_OFFSET_MS,
  getSiteSettings,
  lagosDayStart,
} from "@/lib/analytics";

type Totals = { visitors: number; views: number };

async function totalsSince(since: Date | null): Promise<Totals> {
  const rows = since
    ? await prisma.$queryRaw<Totals[]>`
        SELECT COUNT(DISTINCT "visitorId")::int AS visitors, COUNT(*)::int AS views
        FROM "PageView" WHERE "createdAt" >= (${since}::timestamptz AT TIME ZONE 'UTC')
      `
    : await prisma.$queryRaw<Totals[]>`
        SELECT COUNT(DISTINCT "visitorId")::int AS visitors, COUNT(*)::int AS views
        FROM "PageView"
      `;

  return rows[0] ?? { visitors: 0, views: 0 };
}

const STATIC_PAGES: Record<string, string> = {
  "/": "Home",
  "/comics": "Comics library",
  "/stories": "Stories library",
  "/library": "My library",
  "/coins": "Buy coins",
  "/login": "Log in",
  "/register": "Register",
  "/about": "About us",
  "/contact": "Contact",
  "/faq": "FAQ",
  "/terms": "Terms",
  "/privacy": "Privacy policy",
  "/refund-policy": "Refund policy",
  "/success": "Payment success",
};

/** Turns paths like /read/<id> into human titles. */
async function labelPaths(paths: string[]) {
  const comicIds = new Set<string>();
  const storyIds = new Set<string>();
  const chapterIds = new Set<string>();

  for (const path of paths) {
    const parts = path.split("/").filter(Boolean);
    if (parts[0] === "read" && parts[1]) comicIds.add(parts[1]);
    if (parts[0] === "stories" && parts[1]) storyIds.add(parts[1]);
    if (parts[0] === "stories" && parts[2] === "chapters" && parts[3]) {
      chapterIds.add(parts[3]);
    }
  }

  const [comics, stories, chapters] = await Promise.all([
    prisma.comic.findMany({
      where: { id: { in: [...comicIds] } },
      select: { id: true, title: true },
    }),
    prisma.story.findMany({
      where: { id: { in: [...storyIds] } },
      select: { id: true, title: true },
    }),
    prisma.chapter.findMany({
      where: { id: { in: [...chapterIds] } },
      select: { id: true, number: true, title: true },
    }),
  ]);

  const comicTitle = new Map(comics.map((c) => [c.id, c.title]));
  const storyTitle = new Map(stories.map((s) => [s.id, s.title]));
  const chapterLabel = new Map(
    chapters.map((c) => [c.id, `Ch. ${c.number}: ${c.title}`])
  );

  return (path: string) => {
    if (STATIC_PAGES[path]) return STATIC_PAGES[path];

    const parts = path.split("/").filter(Boolean);

    if (parts[0] === "read") {
      return `Comic · ${comicTitle.get(parts[1]) ?? "deleted comic"}`;
    }

    if (parts[0] === "stories" && parts[2] === "chapters") {
      return `${storyTitle.get(parts[1]) ?? "Story"} · ${
        chapterLabel.get(parts[3]) ?? "chapter"
      }`;
    }

    if (parts[0] === "stories") {
      return `Story · ${storyTitle.get(parts[1]) ?? "deleted story"}`;
    }

    return path;
  };
}

/**
 * GET /api/admin/visitors?days=30
 * Admin only. Visitor statistics for the dashboard.
 */
export async function GET(req: Request) {
  const user = getUserFromToken(req);

  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const requested = Number(new URL(req.url).searchParams.get("days"));
  const days = [7, 30, 90].includes(requested) ? requested : 30;
  const rangeStart = lagosDayStart(days - 1);
  const offset = `${LAGOS_OFFSET_MS / 3_600_000} hours`;

  try {
    const [
      today,
      yesterday,
      last7,
      last30,
      allTime,
      onlineNow,
      daily,
      pages,
      sources,
      settings,
    ] = await Promise.all([
      totalsSince(lagosDayStart(0)),
      prisma.$queryRaw<Totals[]>`
        SELECT COUNT(DISTINCT "visitorId")::int AS visitors, COUNT(*)::int AS views
        FROM "PageView"
        WHERE "createdAt" >= (${lagosDayStart(1)}::timestamptz AT TIME ZONE 'UTC') AND "createdAt" < (${lagosDayStart(0)}::timestamptz AT TIME ZONE 'UTC')
      `.then((rows) => rows[0] ?? { visitors: 0, views: 0 }),
      totalsSince(lagosDayStart(6)),
      totalsSince(lagosDayStart(29)),
      totalsSince(null),
      prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(DISTINCT "visitorId")::int AS count
        FROM "PageView" WHERE "createdAt" >= (${new Date(Date.now() - 5 * 60_000)}::timestamptz AT TIME ZONE 'UTC')
      `.then((rows) => rows[0]?.count ?? 0),
      prisma.$queryRaw<{ day: string; visitors: number; views: number }[]>`
        SELECT to_char(("createdAt" + ${offset}::interval)::date, 'YYYY-MM-DD') AS day,
               COUNT(DISTINCT "visitorId")::int AS visitors,
               COUNT(*)::int AS views
        FROM "PageView"
        WHERE "createdAt" >= (${rangeStart}::timestamptz AT TIME ZONE 'UTC')
        GROUP BY 1 ORDER BY 1
      `,
      prisma.$queryRaw<{ path: string; visitors: number; views: number }[]>`
        SELECT "path", COUNT(DISTINCT "visitorId")::int AS visitors, COUNT(*)::int AS views
        FROM "PageView"
        WHERE "createdAt" >= (${rangeStart}::timestamptz AT TIME ZONE 'UTC')
        GROUP BY "path" ORDER BY visitors DESC, views DESC
        LIMIT 10
      `,
      prisma.$queryRaw<{ source: string; visitors: number }[]>`
        SELECT "source", COUNT(DISTINCT "visitorId")::int AS visitors
        FROM "PageView"
        WHERE "createdAt" >= (${rangeStart}::timestamptz AT TIME ZONE 'UTC')
        GROUP BY "source" ORDER BY visitors DESC
        LIMIT 10
      `,
      getSiteSettings(),
    ]);

    // Fill in days with no visits so the chart has no gaps.
    const byDay = new Map(daily.map((d) => [d.day, d]));
    const series = Array.from({ length: days }, (_, i) => {
      const date = new Date(rangeStart.getTime() + LAGOS_OFFSET_MS + i * 86_400_000);
      const day = date.toISOString().slice(0, 10);
      return byDay.get(day) ?? { day, visitors: 0, views: 0 };
    });

    const label = await labelPaths(pages.map((p) => p.path));

    return NextResponse.json({
      days,
      totals: { today, yesterday, last7, last30, allTime },
      onlineNow,
      series,
      pages: pages.map((p) => ({ ...p, label: label(p.path) })),
      sources,
      settings: {
        showReaderCount: settings.showReaderCount,
        readerCountLabel: settings.readerCountLabel,
      },
    });
  } catch (error) {
    console.error("VISITOR STATS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load visitor stats" },
      { status: 500 }
    );
  }
}
