import { prisma } from "@/lib/prisma";

const BOT_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegrambot|preview|headless|lighthouse|pingdom|curl|wget|python-requests/i;

/** Link-preview fetchers and crawlers should not count as visitors. */
export function isBot(userAgent: string | null) {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

const KNOWN_SOURCES: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|m\.facebook\.com|l\.facebook\.com)$/, "Facebook"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "X (Twitter)"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)(t\.me|telegram\.org)$/, "Telegram"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
  [/(^|\.)snapchat\.com$/, "Snapchat"],
  [/(^|\.)linkedin\.com$/, "LinkedIn"],
];

const UTM_NAMES: Record<string, string> = {
  ig: "Instagram",
  instagram: "Instagram",
  fb: "Facebook",
  facebook: "Facebook",
  google: "Google",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  twitter: "X (Twitter)",
  x: "X (Twitter)",
  telegram: "Telegram",
  youtube: "YouTube",
};

/**
 * Works out where a visit came from.
 * An ad link's ?utm_source=... wins; otherwise the referring site;
 * otherwise "Direct" (typed the address, bookmark, or an app that hides it).
 */
export function classifySource(
  utmSource: string | null | undefined,
  referrer: string | null | undefined,
  ownHost: string
) {
  const utm = utmSource?.trim().slice(0, 60);

  if (utm) {
    return UTM_NAMES[utm.toLowerCase()] ?? utm;
  }

  if (!referrer) return "Direct";

  let host: string;

  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return "Direct";
  }

  if (host === ownHost || host === `www.${ownHost}` || `www.${host}` === ownHost) {
    return "Direct";
  }

  for (const [pattern, name] of KNOWN_SOURCES) {
    if (pattern.test(host)) return name;
  }

  return host.replace(/^www\./, "");
}

/** Pages that should never be counted (admin and writer screens). */
export function isTrackablePath(path: string) {
  return (
    path.startsWith("/") &&
    path.length <= 300 &&
    !path.startsWith("/api") &&
    !path.startsWith("/admin") &&
    !path.startsWith("/upload")
  );
}

/** Nigeria (WAT) is UTC+1 all year, so days are counted in Lagos time. */
export const LAGOS_OFFSET_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** UTC instant at which "today" started in Lagos, shifted back `daysAgo` days. */
export function lagosDayStart(daysAgo = 0) {
  const lagosNow = Date.now() + LAGOS_OFFSET_MS;
  const lagosMidnight = Math.floor(lagosNow / DAY_MS) * DAY_MS;
  return new Date(lagosMidnight - LAGOS_OFFSET_MS - daysAgo * DAY_MS);
}

let readerCountCache: { value: number; at: number } | null = null;

/**
 * All-time unique visitors, shown publicly as the reader count.
 * Cached for a minute so busy pages don't hit the database every time.
 */
export async function getReaderCount() {
  if (readerCountCache && Date.now() - readerCountCache.at < 60_000) {
    return readerCountCache.value;
  }

  const rows = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(DISTINCT "visitorId")::int AS count FROM "PageView"
  `;

  readerCountCache = { value: rows[0]?.count ?? 0, at: Date.now() };
  return readerCountCache.value;
}

export async function getSiteSettings() {
  return prisma.siteSettings.upsert({
    where: { id: "site" },
    update: {},
    create: { id: "site" },
  });
}
