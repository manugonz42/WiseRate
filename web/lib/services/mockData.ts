import type {
  BrandColor,
  DeliveryEstimate,
  HistoricalRate,
  SponsoredOffer,
  TimeFrame,
  TransferProvider,
  TransferQuote,
} from "@/lib/models";
import { TIMEFRAME_LOOKBACK_DAYS } from "@/lib/models";

// Ported from iOS WiseRate/Data/Mock/MockData.swift — keep in parity.
export const PROVIDERS: TransferProvider[] = [
  { id: "wise", name: "Wise", iconName: "W", brandColor: "green", trustScore: 4.8, userRating: 4.7, websiteURL: "https://wise.com", affiliateURL: "https://wise.com/invite/u/maria123" },
  { id: "remitly", name: "Remitly", iconName: "R", brandColor: "blue", trustScore: 4.6, userRating: 4.5, websiteURL: "https://remitly.com", affiliateURL: "https://remitly.com/invite/maria123" },
  { id: "western_union", name: "Western Union", iconName: "WU", brandColor: "yellow", trustScore: 4.2, userRating: 4.0, websiteURL: "https://westernunion.com", affiliateURL: "https://westernunion.com/affiliate/maria123" },
  { id: "worldremit", name: "WorldRemit", iconName: "WR", brandColor: "teal", trustScore: 4.5, userRating: 4.3, websiteURL: "https://worldremit.com", affiliateURL: "https://worldremit.com/invite/maria123" },
  { id: "xoom", name: "Xoom", iconName: "X", brandColor: "indigo", trustScore: 4.4, userRating: 4.2, websiteURL: "https://xoom.com", affiliateURL: "https://xoom.com/affiliate/maria123" },
  { id: "moneygram", name: "MoneyGram", iconName: "MG", brandColor: "red", trustScore: 4.3, userRating: 4.1, websiteURL: "https://moneygram.com", affiliateURL: null },
  { id: "skrill", name: "Skrill", iconName: "S", brandColor: "purple", trustScore: 4.1, userRating: 4.0, websiteURL: "https://skrill.com", affiliateURL: null },
  { id: "revolut", name: "Revolut", iconName: "R", brandColor: "blue", trustScore: 4.6, userRating: 4.5, websiteURL: "https://revolut.com", affiliateURL: "https://revolut.com/invite/maria123" },
  { id: "ofx", name: "OFX", iconName: "O", brandColor: "cyan", trustScore: 4.5, userRating: 4.4, websiteURL: "https://ofx.com", affiliateURL: null },
  { id: "xe", name: "Xe", iconName: "Xe", brandColor: "orange", trustScore: 4.4, userRating: 4.3, websiteURL: "https://xe.com", affiliateURL: null },
  { id: "santander", name: "Santander", iconName: "SB", brandColor: "red", trustScore: 3.8, userRating: 3.5, websiteURL: "https://santander.com", affiliateURL: null },
  { id: "bbva", name: "BBVA", iconName: "BBVA", brandColor: "blue", trustScore: 3.9, userRating: 3.6, websiteURL: "https://bbva.com", affiliateURL: null },
  { id: "caixabank", name: "CaixaBank", iconName: "CB", brandColor: "blue", trustScore: 3.7, userRating: 3.4, websiteURL: "https://caixabank.com", affiliateURL: null },
  { id: "n26", name: "N26", iconName: "N26", brandColor: "blue", trustScore: 4.5, userRating: 4.4, websiteURL: "https://n26.com", affiliateURL: "https://n26.com/invite/maria123" },
  { id: "ing", name: "ING", iconName: "ING", brandColor: "orange", trustScore: 4.2, userRating: 4.1, websiteURL: "https://ing.com", affiliateURL: null },
];

// [id, rateDelta, fee, delivery, markup, isPromotion, promotionText]
type QuoteSpec = [string, number, number, DeliveryEstimate, number, boolean, string | null];

const QUOTE_SPECS: QuoteSpec[] = [
  ["wise", 0.12, 2.99, "hours", 0.001, false, null],
  ["remitly", 0.05, 3.99, "instant", 0.003, false, null],
  ["western_union", -0.3, 4.99, "instant", 0.008, false, null],
  ["worldremit", 0.02, 3.49, "minutes", 0.004, false, null],
  ["xoom", -0.1, 3.99, "hours", 0.005, false, null],
  ["moneygram", -0.25, 5.99, "instant", 0.007, false, null],
  ["skrill", -0.15, 4.49, "hours", 0.006, false, null],
  ["revolut", 0.15, 0.0, "hours", 0.001, false, null],
  ["ofx", 0.08, 0.0, "nextDay", 0.002, false, null],
  ["xe", 0.0, 2.49, "sameDay", 0.003, false, null],
  ["santander", -1.2, 15.0, "twoToThreeDays", 0.015, false, null],
  ["bbva", -0.95, 12.0, "twoToThreeDays", 0.012, false, null],
  ["caixabank", -1.1, 14.0, "threeToFiveDays", 0.014, false, null],
  ["n26", 0.1, 1.5, "hours", 0.002, true, "Special promotion — 0% fee on first transfer"],
  ["ing", -0.8, 10.0, "nextDay", 0.01, false, null],
];

const byId = (id: string): TransferProvider | undefined =>
  PROVIDERS.find((p) => p.id === id);

export function generateQuotes(amount: number, baseRate = 63.5): TransferQuote[] {
  return QUOTE_SPECS.map(([id, rateDelta, fee, delivery, markup, isPromotion, promotionText]) => {
    const provider = byId(id);
    const exchangeRate = baseRate + rateDelta;
    const receiveAmount = Math.max(0, (amount - fee) * exchangeRate);
    return {
      providerID: id,
      providerName: provider?.name ?? id,
      providerIcon: provider?.iconName ?? id.slice(0, 2).toUpperCase(),
      brandColor: (provider?.brandColor ?? "gray") as BrandColor,
      sendAmount: amount,
      sendCurrency: "EUR",
      receiveCurrency: "PHP",
      exchangeRate,
      fee,
      feeCurrency: "EUR",
      receiveAmount,
      deliveryEstimate: delivery,
      markup,
      isPromotion,
      promotionText,
    };
  });
}

// Deterministic pseudo-random so server and client render identically (no
// hydration mismatch) and the sparkline is stable across renders.
function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateHistoricalRates(timeFrame: TimeFrame): HistoricalRate[] {
  const lookbackDays = TIMEFRAME_LOOKBACK_DAYS[timeFrame];
  const count = timeFrame === "24H" ? 24 : timeFrame === "7D" ? 7 * 24 : timeFrame === "1Y" ? 52 : lookbackDays;
  const intervalMs = (lookbackDays * 86400 * 1000) / count;
  const now = Date.now();
  const rand = seeded(lookbackDays * 7919);

  const rates: HistoricalRate[] = [];
  let rate = 62.0;
  for (let i = 0; i < count; i++) {
    rate = Math.max(58.0, Math.min(68.0, rate + (rand() - 0.5) * 0.3));
    rates.push({ date: now - intervalMs * (count - i), rate });
  }
  return rates;
}

export const SPONSORED_OFFERS: SponsoredOffer[] = [
  {
    providerName: "N26",
    providerIcon: "N26",
    brandColor: "blue",
    headline: "Open N26 & Get 0% Transfer Fee",
    description: "Send your first €500 with zero fees when you open an N26 account today.",
    ctaText: "Open Account",
    affiliateURL: "https://n26.com/invite/maria123",
    discountPercentage: 100,
  },
  {
    providerName: "Revolut",
    providerIcon: "R",
    brandColor: "blue",
    headline: "Revolut Premium: Free Transfers",
    description: "Upgrade to Premium and enjoy unlimited free international transfers at the real exchange rate.",
    ctaText: "Try Premium",
    affiliateURL: "https://revolut.com/invite/maria123",
    discountPercentage: null,
  },
];
