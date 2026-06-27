import type { BrandColor, DeliveryEstimate, TransferQuote } from "@/lib/models";
import { PROVIDERS } from "@/lib/services/mockData";

// Public Wise Comparisons API — no credentials. Returns real price+speed for
// Wise and tracked competitors (bank-transfer pay-in/pay-out only) for a pair +
// amount. See docs/reference/providers-eur-php.md + docs/services/quotes-server.md.
const WISE_COMPARISON_URL = "https://api.wise.com/v3/comparisons/";

// 15 min — the web server stores the upstream result and refreshes on this cadence.
export const QUOTES_REVALIDATE_SECONDS = 900;

interface WiseQuote {
  fee: number;
  rate: number;
  receivedAmount: number;
  markup: number; // percent over mid-market at collection time
  deliveryEstimation?: {
    duration?: { min?: string | null } | null;
  } | null;
}

interface WiseProvider {
  alias: string;
  name: string;
  type: "bank" | "moneyTransferProvider";
  quotes: WiseQuote[];
}

interface WiseResponse {
  providers: WiseProvider[];
}

const metaById = new Map(PROVIDERS.map((p) => [p.id, p]));

// Wise aliases use kebab-case ("western-union"); our ids use snake_case.
const aliasToId = (alias: string): string => alias.replace(/-/g, "_");

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 3)
    .toUpperCase();

// Best (highest received) quote per provider — a provider may carry several
// collected quotes (funding methods / timestamps).
function pickBest(quotes: WiseQuote[]): WiseQuote | null {
  return quotes.reduce<WiseQuote | null>(
    (best, q) => (!best || q.receivedAmount > best.receivedAmount ? q : best),
    null,
  );
}

function parseIsoHours(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 6;
  return Number(m[1] ?? 0) + Number(m[2] ?? 0) / 60;
}

function deliveryFrom(q: WiseQuote): DeliveryEstimate {
  const iso = q.deliveryEstimation?.duration?.min ?? null;
  if (!iso) return "hours";
  const h = parseIsoHours(iso);
  if (h <= 0.1) return "instant";
  if (h < 1) return "minutes";
  if (h <= 12) return "hours";
  if (h <= 24) return "sameDay";
  if (h <= 48) return "nextDay";
  if (h <= 72) return "twoToThreeDays";
  return "threeToFiveDays";
}

/**
 * Fetch + normalize live EUR→PHP quotes from the Wise Comparisons API.
 * Cached by Next's data cache for QUOTES_REVALIDATE_SECONDS (server-side).
 */
export async function fetchWiseQuotes(amount: number): Promise<TransferQuote[]> {
  const url = `${WISE_COMPARISON_URL}?sourceCurrency=EUR&targetCurrency=PHP&sendAmount=${amount}`;
  const res = await fetch(url, { next: { revalidate: QUOTES_REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`Wise comparison API ${res.status}`);
  const data = (await res.json()) as WiseResponse;

  const quotes: TransferQuote[] = [];
  for (const p of data.providers ?? []) {
    const best = pickBest(p.quotes ?? []);
    if (!best) continue;
    const id = aliasToId(p.alias);
    const meta = metaById.get(id);
    quotes.push({
      providerID: id,
      providerName: meta?.name ?? p.name,
      providerIcon: meta?.iconName ?? initials(p.name),
      brandColor: (meta?.brandColor ?? "gray") as BrandColor,
      sendAmount: amount,
      sendCurrency: "EUR",
      receiveCurrency: "PHP",
      exchangeRate: best.rate,
      fee: best.fee,
      feeCurrency: "EUR",
      receiveAmount: best.receivedAmount,
      deliveryEstimate: deliveryFrom(best),
      markup: Math.max(0, (best.markup ?? 0) / 100), // percent → 0..1 (model convention)
      isPromotion: false,
      promotionText: null,
    });
  }
  quotes.sort((a, b) => b.receiveAmount - a.receiveAmount);
  return quotes;
}
