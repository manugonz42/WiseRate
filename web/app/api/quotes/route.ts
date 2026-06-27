import { NextResponse } from "next/server";
import { fetchWiseQuotes } from "@/lib/services/wiseComparison";
import { generateQuotes } from "@/lib/services/mockData";

// Live EUR→PHP quotes. The Wise Comparisons API call inside fetchWiseQuotes is
// cached by Next's data cache for 15 min, so the server stores + refreshes on
// that cadence (a Vercel Cron in vercel.json warms it). Mock fallback on error
// keeps the comparator rendering. See docs/platforms/web.md.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = Number(searchParams.get("amount"));
  const amount = Number.isFinite(raw) && raw > 0 ? raw : 500;

  try {
    const quotes = await fetchWiseQuotes(amount);
    return NextResponse.json({ quotes, source: "wise-comparison", fetchedAt: Date.now() });
  } catch {
    const quotes = generateQuotes(amount);
    return NextResponse.json({ quotes, source: "mock-fallback", fetchedAt: Date.now() });
  }
}
