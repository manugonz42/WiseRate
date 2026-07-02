// Server-side adapter for the Wise Comparisons API.
//
// This is the single "no-scraping" quote source: an official, public, no-key
// endpoint that returns EUR->PHP quotes for Wise AND the other regulated
// providers in one call, plus a mid-market reference. See
// docs/services/exchange-rate.md (this replaces the per-provider scrape plan
// for the providers this endpoint already covers).

import type {
  DeliveryEstimate,
  Rate,
  TransferQuote,
} from "@/lib/models/types";
import { trustFor } from "./trust";

const WISE_BASE = "https://api.wise.com/v4/comparisons/";

interface WiseLogoVariant {
  svgUrl: string | null;
  pngUrl: string | null;
}
interface WiseQuote {
  fee: number;
  markup: number; // percentage, e.g. 2.55 == 2.55%
  rate: number; // target per source unit
  receivedAmount: number;
  isConsideredMidMarketRate?: boolean;
  deliveryEstimation?: {
    duration?: { min?: number; max?: number } | null;
  };
}
interface WiseProvider {
  id: number;
  alias: string;
  name: string;
  type: string;
  partner?: boolean;
  logos?: {
    normal?: WiseLogoVariant;
    circle?: WiseLogoVariant;
    white?: WiseLogoVariant;
  };
  quotes: WiseQuote[];
}
interface WiseResponse {
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  providers: WiseProvider[];
}

const logoUrl = (p: WiseProvider): string =>
  p.logos?.circle?.svgUrl ??
  p.logos?.normal?.svgUrl ??
  p.logos?.normal?.pngUrl ??
  "";

// Wise durations, when present, are in seconds — but the API has also been
// observed sending an ISO 8601 duration string (e.g. "PT24H"); guard against
// both so a shape we don't recognize degrades to "Not specified" instead of
// propagating NaN into the quote.
const deliveryEstimate = (q: WiseQuote): DeliveryEstimate => {
  const d = q.deliveryEstimation?.duration;
  if (!d || d.min == null || d.max == null) {
    return { minMinutes: 0, maxMinutes: 0, label: "Not specified" };
  }
  const minMinutes = Math.round(Number(d.min) / 60);
  const maxMinutes = Math.round(Number(d.max) / 60);
  if (!Number.isFinite(minMinutes) || !Number.isFinite(maxMinutes)) {
    return { minMinutes: 0, maxMinutes: 0, label: "Not specified" };
  }
  return { minMinutes, maxMinutes, label: durationLabel(minMinutes, maxMinutes) };
};

const durationLabel = (min: number, max: number): string => {
  if (max <= 0) return "Not specified";
  if (max <= 5) return "Instant";
  if (max < 60) return `${max} min`;
  if (max < 60 * 24) {
    const h = Math.round(max / 60);
    return h <= 1 ? "~1 hour" : `~${h} hours`;
  }
  const dMin = Math.max(1, Math.round(min / (60 * 24)));
  const dMax = Math.round(max / (60 * 24));
  return dMin === dMax ? `${dMax} days` : `${dMin}-${dMax} days`;
};

export interface WiseQuotesResult {
  rate: Rate;
  quotes: TransferQuote[];
}

export function buildRequest(
  from: string,
  to: string,
  amount: number,
): { url: string; init?: RequestInit } {
  const url = `${WISE_BASE}?sourceCurrency=${encodeURIComponent(
    from,
  )}&targetCurrency=${encodeURIComponent(to)}&sendAmount=${amount}`;

  return {
    url,
    init: {
      headers: { Accept: "application/json" },
      // Cache per docs/services/exchange-rate.md: quotes TTL 2 min.
      next: { revalidate: 120 },
    },
  };
}

export function parseWiseQuotes(
  json: unknown,
  from: string,
  to: string,
  amount: number,
): WiseQuotesResult {
  const data = json as WiseResponse;
  const timestamp = new Date().toISOString();
  const providers = data?.providers ?? [];

  // Mid-market reference: prefer the flagged quote, else the highest rate seen.
  let midRate = 0;
  for (const p of providers) {
    for (const q of p.quotes) {
      if (q.isConsideredMidMarketRate && q.rate > midRate) midRate = q.rate;
    }
  }
  if (midRate === 0) {
    midRate = Math.max(0, ...providers.flatMap((p) => p.quotes.map((q) => q.rate)));
  }

  const quotes: TransferQuote[] = [];
  for (const p of providers) {
    const q = p.quotes[0];
    if (!q) continue;
    // `isConsideredMidMarketRate` flags a real, sendable quote whose rate
    // equals mid-market (typically Wise's own, with a real fee). It feeds the
    // `rate` reference above but must stay in the list — skipping it removed
    // Wise itself from the comparison.

    quotes.push({
      id: `${p.alias}-${p.id}`,
      providerID: p.alias,
      providerName: p.name,
      providerIcon: logoUrl(p),
      sendAmount: amount,
      sendCurrency: from,
      receiveCurrency: to,
      exchangeRate: q.rate,
      fee: q.fee,
      feeCurrency: from,
      receiveAmount: q.receivedAmount,
      deliveryEstimate: deliveryEstimate(q),
      // Wise comparisons don't expose delivery method; default until we have
      // a source that does. Delivery-method filter chips are deferred.
      deliveryMethod: "bankTransfer",
      markup: q.markup / 100, // percentage -> 0..1 per data-model
      isPromotion: false,
      trustScore: trustFor(p.alias),
      isMidMarketReference: false,
      // Numbers Wise attributes to competitors — filler until a direct
      // source covers the provider (docs/services/exchange-rate.md).
      source: "wise-comparisons",
    });
  }

  return {
    rate: { rate: midRate, timestamp },
    quotes,
  };
}

export async function fetchWiseQuotes(
  from: string,
  to: string,
  amount: number,
): Promise<WiseQuotesResult> {
  const { url, init } = buildRequest(from, to, amount);
  const res = await fetch(url, init);

  if (!res.ok) {
    throw new Error(`Wise comparisons API returned ${res.status}`);
  }

  const data = await res.json();
  return parseWiseQuotes(data, from, to, amount);
}
