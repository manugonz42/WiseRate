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
  trustScore: number; // 0..1
  isMidMarketReference: boolean;
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

// --- derived helpers (mirror the `derived` fields in data-model.md) ---

export const totalCost = (q: TransferQuote): number =>
  q.fee + q.sendAmount * q.markup;

export const markupPercentage = (q: TransferQuote): number => q.markup * 100;
