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

const WISE_BASE = "https://api.wise.com/v4/comparisons/";

// Editorial trust scores for the "most trusted" sort. Grounded in
// proveedores.md ("100% fiables"). Keyed by Wise provider alias; unknown
// providers fall back to DEFAULT_TRUST.
const TRUST: Record<string, number> = {
  wise: 0.98,
  westernunion: 0.95,
  moneygram: 0.93,
  remitly: 0.93,
  worldremit: 0.92,
  ria: 0.9,
  xoom: 0.9,
  moneytrans: 0.9,
  transfergo: 0.88,
  instarem: 0.88,
  smallworld: 0.87,
  xe: 0.87,
  currencyfair: 0.85,
  ofx: 0.85,
  revolut: 0.86,
};
const DEFAULT_TRUST = 0.75;

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

// Wise durations, when present, are in seconds.
const deliveryEstimate = (q: WiseQuote): DeliveryEstimate => {
  const d = q.deliveryEstimation?.duration;
  if (!d || d.min == null || d.max == null) {
    return { minMinutes: 0, maxMinutes: 0, label: "Not specified" };
  }
  const minMinutes = Math.round(d.min / 60);
  const maxMinutes = Math.round(d.max / 60);
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

export async function fetchWiseQuotes(
  from: string,
  to: string,
  amount: number,
): Promise<WiseQuotesResult> {
  const url = `${WISE_BASE}?sourceCurrency=${encodeURIComponent(
    from,
  )}&targetCurrency=${encodeURIComponent(to)}&sendAmount=${amount}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    // Cache per docs/services/exchange-rate.md: quotes TTL 2 min.
    next: { revalidate: 120 },
  });

  if (!res.ok) {
    throw new Error(`Wise comparisons API returned ${res.status}`);
  }

  const data = (await res.json()) as WiseResponse;
  const timestamp = new Date().toISOString();

  // Mid-market reference: prefer the flagged quote, else the highest rate seen.
  let midRate = 0;
  for (const p of data.providers) {
    for (const q of p.quotes) {
      if (q.isConsideredMidMarketRate && q.rate > midRate) midRate = q.rate;
    }
  }
  if (midRate === 0) {
    midRate = Math.max(
      0,
      ...data.providers.flatMap((p) => p.quotes.map((q) => q.rate)),
    );
  }

  const quotes: TransferQuote[] = [];
  for (const p of data.providers) {
    const q = p.quotes[0];
    if (!q) continue;
    // Skip the synthetic mid-market row; it is exposed via `rate`, not as a
    // sendable provider quote.
    if (q.isConsideredMidMarketRate) continue;

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
      trustScore: TRUST[p.alias] ?? DEFAULT_TRUST,
      isMidMarketReference: false,
    });
  }

  return {
    rate: { rate: midRate, timestamp },
    quotes,
  };
}
