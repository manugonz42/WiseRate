import { NextRequest, NextResponse } from "next/server";
import { rangeToDateWindow } from "@/lib/services/history";
import type { HistoricalRate, HistoryRange, HistoryResponse } from "@/lib/models/types";

// GET /api/history?from=EUR&to=PHP&range=30D
//
// Daily mid-market series from Frankfurter (ECB) — one rate per business day,
// so 24H is not supported (docs/services/exchange-rate.md "Known source
// limitations"). Cached via Next's fetch cache (TTL per
// docs/services/exchange-rate.md: >=7D ranges = 1h).
const VALID_RANGES: HistoryRange[] = ["7D", "30D", "3M", "6M", "1Y"];

interface FrankfurterResponse {
  base: string;
  start_date: string;
  end_date: string;
  rates: Record<string, Record<string, number>>;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const from = (params.get("from") ?? "EUR").toUpperCase();
  const to = (params.get("to") ?? "PHP").toUpperCase();
  const range = params.get("range") ?? "30D";

  if (!VALID_RANGES.includes(range as HistoryRange)) {
    return NextResponse.json(
      { error: "24H not supported — daily ECB data only" },
      { status: 400 },
    );
  }

  const { start, end } = rangeToDateWindow(range as HistoryRange);

  try {
    const res = await fetch(
      `https://api.frankfurter.dev/v1/${start}..${end}?base=${from}&symbols=${to}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) throw new Error(`frankfurter ${res.status}`);
    const data = (await res.json()) as FrankfurterResponse;

    const rates: HistoricalRate[] = Object.entries(data.rates)
      .map(([date, byCurrency]) => ({ date, rate: byCurrency[to] }))
      .filter((r) => Number.isFinite(r.rate))
      .sort((a, b) => a.date.localeCompare(b.date));

    const body: HistoryResponse = { from, to, range: range as HistoryRange, rates };
    return NextResponse.json(body);
  } catch (err) {
    console.error("[/api/history] upstream failure:", err);
    return NextResponse.json(
      { error: "upstream_unavailable" },
      { status: 502 },
    );
  }
}
