import { NextRequest, NextResponse } from "next/server";
import { getAggregatedQuotes, stripMockInProduction } from "@/lib/services/quotes";
import type { DeliveryMethod, QuotesResponse } from "@/lib/models/types";

// Delivery methods a client may filter by. Kept in sync with DeliveryMethod;
// an unknown/absent value means "no filter" (best quote per source).
const FILTERABLE_METHODS = new Set<DeliveryMethod>([
  "bankTransfer",
  "cashPickup",
  "mobileWallet",
]);

// GET /api/quotes?from=EUR&to=PHP&amount=1000&method=bankTransfer
//
// Server-side proxy so the client never deals with CORS or upstream keys
// (docs/services/exchange-rate.md). Backed by the direct provider endpoints
// plus the Wise Comparisons API as filler — see lib/services/quotes.ts.
// `method` filters by delivery method (WU + TransferGo re-price; others keep
// their default quote); omit it for the best quote per provider.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const from = (params.get("from") ?? "EUR").toUpperCase();
  const to = (params.get("to") ?? "PHP").toUpperCase();
  const amount = Number(params.get("amount") ?? "1000");
  const methodParam = params.get("method") as DeliveryMethod | null;
  const method =
    methodParam && FILTERABLE_METHODS.has(methodParam) ? methodParam : undefined;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "invalid amount" },
      { status: 400 },
    );
  }

  try {
    const { rate, quotes } = await getAggregatedQuotes(from, to, amount, method);
    const body: QuotesResponse = {
      from,
      to,
      amount,
      rate,
      quotes: stripMockInProduction(quotes),
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
