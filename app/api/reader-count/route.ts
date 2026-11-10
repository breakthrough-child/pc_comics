import { NextResponse } from "next/server";
import { getReaderCount, getSiteSettings } from "@/lib/analytics";

/**
 * GET /api/reader-count
 *
 * The public reader counter. The number is only returned while the
 * admin has switched the counter on.
 */
export async function GET() {
  try {
    const settings = await getSiteSettings();

    if (!settings.showReaderCount) {
      return NextResponse.json({ show: false });
    }

    return NextResponse.json({
      show: true,
      label: settings.readerCountLabel,
      count: await getReaderCount(),
    });
  } catch (error) {
    console.error("READER COUNT ERROR:", error);
    return NextResponse.json({ show: false });
  }
}
