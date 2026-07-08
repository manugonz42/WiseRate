// Quote aggregator — the single entry point behind /api/quotes.
//
// Tiers (docs/services/exchange-rate.md):
//   1. direct provider endpoints (Wise, Western Union, Remitly, TransferGo)
//   2. Wise Comparisons API as filler for everyone else
// A direct quote replaces the comparisons row for the same providerID (the
// comparisons logo is kept); a failed direct source silently falls back to
// its comparisons row. Ranking data (receiveAmount) is always the standard,
// no-promo price when the provider publishes one.

import type { DeliveryMethod, Rate, TransferQuote } from "@/lib/models/types";
import { fetchWiseQuotes } from "./wise";
import { fetchWiseDirect } from "./providers/wiseDirect";
import { fetchWesternUnion } from "./providers/westernUnion";
import { fetchRemitly } from "./providers/remitly";
import { fetchTransferGo } from "./providers/transfergo";
import { fetchCurrencyFair } from "./providers/currencyfair";
import { getCached, setCached } from "./cache";

export interface AggregatedQuotes {
  rate: Rate;
  quotes: TransferQuote[];
}

// T22 bank referral audit (2026-07-06, docs/plan/T22-quote-fidelity.md): none
// of these traditional banks have a referral/affiliate program for
// international transfers, and we don't trust Wise Comparisons' numbers for
// them either — an unmonetizable, unreliable row has no reason to stay
// listed, so they're dropped from every corridor.
export const EXCLUDED_PROVIDER_IDS = new Set([
  "abn-amro-bank",
  "bnp",
  "unicredit",
  "wells-fargo",
  "hsbc-australia",
]);

export function filterExcludedProviders(quotes: TransferQuote[]): TransferQuote[] {
  return quotes.filter((q) => !EXCLUDED_PROVIDER_IDS.has(q.providerID));
}

export type SourceStatus = { source: string; ok: boolean; error?: string; at: string };

// Direct sources POST or vary per amount, so Next's fetch cache doesn't help;
// hold one TTL cache over the whole aggregated result instead (quotes TTL
// 2 min per docs/services/exchange-rate.md). Backed by Upstash KV in prod,
// falling back to an in-memory Map when unconfigured (see ./cache.ts).
const TTL_SECONDS = 120;

// Snapshot from the most recent actual fetch (not cache hits) — /api/health
// reads this. Persisted in the shared cache next to the quotes entry (same
// TTL): a cold serverless instance hitting a warm Upstash quotes cache never
// runs an aggregation, so module state alone would report an empty (= failing)
// health snapshot.
let lastHealth: SourceStatus[] = [];

const healthKey = (from: string, to: string, amount: number) =>
  `health:v1:${from}:${to}:${amount}`;

export async function getSourceHealth(
  from = "EUR",
  to = "PHP",
  amount = 1000,
): Promise<SourceStatus[]> {
  return (await getCached<SourceStatus[]>(healthKey(from, to, amount))) ?? lastHealth;
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
  // Delivery-method filter. Only Western Union and TransferGo re-price per
  // method; every other source has no per-method endpoint yet, so it returns
  // its default (bank-transfer) quote unchanged — same amount for now, per
  // docs/services/exchange-rate.md. `undefined` = no filter (best per source).
  method?: DeliveryMethod,
): Promise<AggregatedQuotes> {
  const key = `quotes:v1:${from}:${to}:${amount}:${method ?? "all"}`;
  const hit = await getCached<AggregatedQuotes>(key);
  if (hit) return hit;

  const [cmp, wise, wu, remitly, transfergo, currencyfair] = await Promise.allSettled([
    fetchWiseQuotes(from, to, amount),
    fetchWiseDirect(from, to, amount),
    fetchWesternUnion(from, to, amount, method ?? "bankTransfer"),
    fetchRemitly(from, to, amount),
    fetchTransferGo(from, to, amount, method),
    fetchCurrencyFair(from, to, amount),
  ]);

  const at = new Date().toISOString();
  lastHealth = [
    sourceStatus("wise-comparisons", cmp, cmp.status === "fulfilled", at),
    sourceStatus("wise", wise, wise.status === "fulfilled" && wise.value != null, at),
    sourceStatus("western-union", wu, wu.status === "fulfilled" && wu.value != null, at),
    sourceStatus("remitly", remitly, remitly.status === "fulfilled" && remitly.value != null, at),
    sourceStatus("transfergo", transfergo, transfergo.status === "fulfilled" && transfergo.value != null, at),
    sourceStatus("currencyfair", currencyfair, currencyfair.status === "fulfilled" && currencyfair.value != null, at),
  ];
  // Before the all-failed throw below, so a total outage still records health.
  await setCached(healthKey(from, to, amount), lastHealth, TTL_SECONDS);

  const byProvider = new Map<string, TransferQuote>();
  let midRate = 0;

  if (cmp.status === "fulfilled") {
    midRate = cmp.value.rate.rate;
    for (const q of filterExcludedProviders(cmp.value.quotes)) byProvider.set(q.providerID, q);
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
    currencyfair.status === "fulfilled" ? currencyfair.value : null,
  ];
  for (const r of [wise, wu, remitly, transfergo, currencyfair]) {
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

// Defense in depth: no live source currently produces a "mock" quote, but a
// prod response must never surface one if a future fixture/dev path does.
export function stripMockInProduction(quotes: TransferQuote[]): TransferQuote[] {
  if (process.env.NODE_ENV !== "production") return quotes;
  return quotes.filter((q) => q.source !== "mock");
}
