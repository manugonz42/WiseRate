// TS mirror of docs/architecture/data-model.md.
// Only the entities the Comparison feature needs are declared here; extend as
// other modules are ported.

export type DeliveryMethod =
  | "bankTransfer"
  | "cashPickup"
  | "mobileWallet"
  | "homeDelivery"
  | "debitCard";

export interface DeliveryEstimate {
  minMinutes: number;
  maxMinutes: number;
  label: string;
}

// Where a quote's numbers came from — see data-model.md `QuoteSource`.
// "direct" = the provider's own public endpoint; "wise-comparisons" = filler
// attributed to the provider by Wise's comparisons API; "mock" = local fixture.
export type QuoteSource = "direct" | "wise-comparisons" | "mock";

// What kind of offer a PromoInfo represents, so the UI can label it instead
// of lumping every promo under one generic badge:
//  - "first-transfer": the provider's own new-customer pricing (boosted rate
//    and/or waived fee), detected from its API response (Remitly, TransferGo).
//  - "referral": a bonus for using our affiliate link specifically — editorial
//    data from providers.ts, not derived from any quote API.
//  - "other": any offer that doesn't fit the two above.
export type PromoKind = "first-transfer" | "referral" | "other";

// First-transfer / new-customer offer. Base quote fields hold the standard
// (no-promo) price whenever derivable; ranking always uses the base fields.
export interface PromoInfo {
  kind: PromoKind;
  description: string;
  conditions?: string;
  promoFee: number;
  promoReceiveAmount: number;
  promoExchangeRate: number | null;
  // false when the provider publishes no standard price (base == promo price)
  baseIsStandard: boolean;
}

// Editorial "use our link" bonus, independent of any provider API — populated
// per provider in providers.ts once a real affiliate/referral deal exists.
export interface ReferralPromo {
  amount: string;
  conditions: string;
  sourceURL: string;
}

export interface TransferQuote {
  id: string;
  providerID: string;
  providerName: string;
  providerIcon: string; // URL to the provider logo (Wise CDN)
  sendAmount: number;
  sendCurrency: string; // ISO 4217
  receiveCurrency: string; // ISO 4217
  exchangeRate: number;
  fee: number;
  feeCurrency: string;
  receiveAmount: number;
  deliveryEstimate: DeliveryEstimate;
  deliveryMethod: DeliveryMethod;
  markup: number; // 0..1
  isPromotion: boolean;
  promo?: PromoInfo;
  trustScore: number; // 0..1
  isMidMarketReference: boolean;
  source: QuoteSource;
}

export interface Rate {
  rate: number; // mid-market
  timestamp: string; // ISO 8601
}

export interface QuotesResponse {
  from: string;
  to: string;
  amount: number;
  rate: Rate;
  quotes: TransferQuote[];
  stale: boolean;
}

// Frankfurter (ECB) is one rate per business day — no 24H range. See
// docs/services/exchange-rate.md "Known source limitations".
export type HistoryRange = "7D" | "30D" | "3M" | "6M" | "1Y";

// Deliberate subset of data-model.md's HistoricalRate entity: `id`/`provider`
// are omitted — an ECB series needs neither. Not a spec conflict.
export interface HistoricalRate {
  date: string; // ISO 8601 (YYYY-MM-DD)
  rate: number;
}

export interface HistoryResponse {
  from: string;
  to: string;
  range: HistoryRange;
  rates: HistoricalRate[];
}

export interface FeeStructure {
  method: DeliveryMethod;
  fixedFee: number;
  percentageFee: number;
  description: string;
}

// Extends TransferProvider (data-model.md) with the deep-dive view payload.
export interface ProviderDetail {
  id: string;
  name: string;
  brandColor: string;
  trustScore: number; // 0..1, same scale as TransferQuote.trustScore
  userRating: number; // 0..5
  websiteURL: string;
  affiliateURL: string | null;
  // Network sub-ID query param for click attribution (T37, docs/services/
  // referral.md) — e.g. "clickref" for Partnerize, "fobs" for FlexOffers.
  // Unset until the network is confirmed at approval time.
  subIdParam?: string;
  // Editorial "use our link" bonus; unset until a real affiliate/referral
  // deal exists for this provider (same convention as affiliateURL: null).
  referralPromo?: ReferralPromo;
  description: string;
  reviewCount: number;
  transferLimits: { minAmount: number; maxAmount: number; currency: string };
  fees: FeeStructure[];
  deliveryMethods: DeliveryMethod[];
  pros: string[];
  cons: string[];
}

export type AlertNotifyType = "rateAbove" | "rateBelow" | "providerCheapest";

export interface RateAlert {
  id: string;
  targetRate: number;
  isEnabled: boolean;
  createdAt: string; // ISO 8601
  triggeredAt: string | null;
  notifyType: AlertNotifyType;
  providerID?: string; // required when notifyType === "providerCheapest"
}

export interface FavoriteProvider {
  providerID: string;
  addedAt: string; // ISO 8601
}

// Supabase `profiles` row (docs/services/auth.md) — the accounts-backed
// subset of data-model.md's UserProfile. Excludes the localStorage-derived
// fields (alerts, favoriteProviders, recentProviders), which stay in
// PersistenceService regardless of login state.
export type HeardFrom = "search" | "friend" | "social" | "youtube" | "other";

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string; // ISO 8601 date
  countryCode: string; // ISO 3166-1 alpha-2
  emailNotifications: boolean;
  termsAcceptedAt: string; // ISO 8601
  termsVersion: string;
  referralCode: string;
  referredBy: string | null;
  providersUsed: string[] | null;
  heardFrom: HeardFrom | null;
  createdAt: string; // ISO 8601
}

// --- derived helpers (mirror the `derived` fields in data-model.md) ---

export const totalCost = (q: TransferQuote): number =>
  q.fee + q.sendAmount * q.markup;

export const markupPercentage = (q: TransferQuote): number => q.markup * 100;
