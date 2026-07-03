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
import { getCached, setCached } from "./cache";

export interface AggregatedQuotes {
  rate: Rate;
  quotes: TransferQuote[];
}

export type SourceStatus = { source: string; ok: boolean; error?: string; at: string };

// Direct sources POST or vary per amount, so Next's fetch cache doesn't help;
// hold one TTL cache over the whole aggregated result instead (quotes TTL
// 2 min per docs/services/exchange-rate.md). Backed by Upstash KV in prod,
// falling back to an in-memory Map when unconfigured (see ./cache.ts).
const TTL_SECONDS = 120;

// Snapshot from the most recent actual fetch (not cache hits) — /api/health
// reads this. Stays fresh for the same 120 s window as the quotes cache.
let lastHealth: SourceStatus[] = [];

export function getSourceHealth(): SourceStatus[] {
  return lastHealth;
}

const sourceStatus = (
  source: string,
  result: PromiseSettledResult<unknown>,
  hasValue: boolean,
  at: string,
): SourceStatus => {
  if (result.status === "rejected") {
    const reason = result.reason;
    return { source, ok: false, error: reason instanceof Error ? reason.message : String(reason), at };
  }
  if (!hasValue) return { source, ok: false, error: "no quote returned", at };
  return { source, ok: true, at };
};

export async function getAggregatedQuotes(
  from: string,
  to: string,
  amount: number,
): Promise<AggregatedQuotes> {
  const key = `quotes:v1:${from}:${to}:${amount}`;
  const hit = await getCached<AggregatedQuotes>(key);
  if (hit) return hit;

  const [cmp, wise, wu, remitly, transfergo] = await Promise.allSettled([
    fetchWiseQuotes(from, to, amount),
    fetchWiseDirect(from, to, amount),
    fetchWesternUnion(from, to, amount),
    fetchRemitly(from, to, amount),
    fetchTransferGo(from, to, amount),
  ]);

  const at = new Date().toISOString();
  lastHealth = [
    sourceStatus("wise-comparisons", cmp, cmp.status === "fulfilled", at),
    sourceStatus("wise", wise, wise.status === "fulfilled" && wise.value != null, at),
    sourceStatus("western-union", wu, wu.status === "fulfilled" && wu.value != null, at),
    sourceStatus("remitly", remitly, remitly.status === "fulfilled" && remitly.value != null, at),
    sourceStatus("transfergo", transfergo, transfergo.status === "fulfilled" && transfergo.value != null, at),
  ];

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
  await setCached(key, value, TTL_SECONDS);
  return value;
}
