import { NextResponse } from "next/server";
import { getAggregatedQuotes, getSourceHealth } from "@/lib/services/quotes";

// GET /api/health
//
// Exposes per-source outcomes from the last quote aggregation so an external
// monitor (UptimeRobot) can alert when a revenue-carrying source breaks —
// see docs/services/exchange-rate.md "Health".
export async function GET() {
  try {
    await getAggregatedQuotes("EUR", "PHP", 1000);
  } catch (err) {
    console.error("[/api/health] aggregation failed:", err);
  }

  const sources = getSourceHealth();
  const allOk = sources.length > 0 && sources.every((s) => s.ok);

  return NextResponse.json(sources, {
    status: allOk ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
