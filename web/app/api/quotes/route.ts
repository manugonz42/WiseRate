import { NextRequest, NextResponse } from "next/server";
import { fetchWiseQuotes } from "@/lib/services/wise";
import type { QuotesResponse } from "@/lib/models/types";

// GET /api/quotes?from=EUR&to=PHP&amount=1000
//
// Server-side proxy so the client never deals with CORS or upstream keys
// (docs/services/exchange-rate.md). Currently backed solely by the Wise
// Comparisons API — the no-scraping source.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const from = (params.get("from") ?? "EUR").toUpperCase();
  const to = (params.get("to") ?? "PHP").toUpperCase();
  const amount = Number(params.get("amount") ?? "1000");

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "invalid amount" },
      { status: 400 },
    );
  }

  try {
    const { rate, quotes } = await fetchWiseQuotes(from, to, amount);
    const body: QuotesResponse = {
      from,
      to,
      amount,
      rate,
      quotes,
      stale: false,
    };
    return NextResponse.json(body);
  } catch (err) {
    console.error("[/api/quotes] upstream failure:", err);
    return NextResponse.json(
      { error: "upstream_unavailable" },
      { status: 502 },
    );
  }
}
