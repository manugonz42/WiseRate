// Quote aggregator — the single entry point behind /api/quotes.
//
// Tiers (docs/services/exchange-rate.md):
//   1. direct provider endpoints (Wise, Western Union, Remitly, TransferGo)
//   2. Wise Comparisons API as filler for everyone else
// A direct quote replaces the comparisons row for the same providerID (the
// comparisons logo is kept); a failed direct source silently falls back to
// its comparisons row. Ranking data (receiveAmount) is always the standard,
// no-promo price when the provider publishes one.

import type { Rate, TransferQuote } from "@/lib/models/types";
import { fetchWiseQuotes } from "./wise";
import { fetchWiseDirect } from "./providers/wiseDirect";
import { fetchWesternUnion } from "./providers/westernUnion";
import { fetchRemitly } from "./providers/remitly";
import { fetchTransferGo } from "./providers/transfergo";

export interface AggregatedQuotes {
  rate: Rate;
  quotes: TransferQuote[];
}

// Direct sources POST or vary per amount, so Next's fetch cache doesn't help;
// hold one in-memory TTL cache over the whole aggregated result instead
// (quotes TTL 2 min per docs/services/exchange-rate.md).
const TTL_MS = 120_000;
const cache = new Map<string, { at: number; value: AggregatedQuotes }>();

export async function getAggregatedQuotes(
  from: string,
  to: string,
  amount: number,
): Promise<AggregatedQuotes> {
  const key = `${from}:${to}:${amount}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  const [cmp, wise, wu, remitly, transfergo] = await Promise.allSettled([
    fetchWiseQuotes(from, to, amount),
    fetchWiseDirect(from, to, amount),
    fetchWesternUnion(from, to, amount),
    fetchRemitly(from, to, amount),
    fetchTransferGo(from, to, amount),
  ]);

  const byProvider = new Map<string, TransferQuote>();
  let midRate = 0;

  if (cmp.status === "fulfilled") {
    midRate = cmp.value.rate.rate;
    for (const q of cmp.value.quotes) byProvider.set(q.providerID, q);
  } else {
    console.error("[quotes] wise comparisons failed:", cmp.reason);
  }

  // Wise quotes at mid-market, so its direct rate is the mid-market fallback.
  if (midRate <= 0 && wise.status === "fulfilled" && wise.value) {
    midRate = wise.value.rate;
  }

  const directs: (TransferQuote | null)[] = [
    wise.status === "fulfilled" ? (wise.value?.quote ?? null) : null,
    wu.status === "fulfilled" ? wu.value : null,
    remitly.status === "fulfilled" ? remitly.value : null,
    transfergo.status === "fulfilled" ? transfergo.value : null,
  ];
  for (const r of [wise, wu, remitly, transfergo]) {
    if (r.status === "rejected") console.error("[quotes] direct source failed:", r.reason);
  }

  for (const dq of directs) {
    if (!dq) continue;
    const filler = byProvider.get(dq.providerID);
    byProvider.set(dq.providerID, {
      ...dq,
      providerIcon: dq.providerIcon || filler?.providerIcon || "",
      markup: midRate > 0 ? Math.max(0, 1 - dq.exchangeRate / midRate) : 0,
    });
  }

  if (byProvider.size === 0) {
    throw new Error("all quote sources failed");
  }

  const value: AggregatedQuotes = {
    rate: { rate: midRate, timestamp: new Date().toISOString() },
    quotes: [...byProvider.values()],
  };
  cache.set(key, { at: Date.now(), value });
  return value;
}
