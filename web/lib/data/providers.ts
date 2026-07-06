// Editorial provider profiles for /provider/[id]. Ported from the iOS mock
// (WiseRate/Data/Mock/MockData.swift `providerDetails`) for Wise, Western
// Union, Remitly; TransferGo has no iOS mock entry so its copy is written
// fresh from web/lib/services/providers/transfergo.ts's known behavior.
// Every other providerID falls back to a generic profile (see page.tsx).
import type { ProviderDetail } from "@/lib/models/types";

export const PROVIDERS: Record<string, ProviderDetail> = {
  wise: {
    id: "wise",
    name: "Wise",
    brandColor: "success",
    trustScore: 0.98,
    userRating: 4.7,
    websiteURL: "https://wise.com",
    affiliateURL: null,
    description:
      "Wise (formerly TransferWise) is a British fintech that provides international money transfers at the mid-market exchange rate with transparent, upfront fees.",
    reviewCount: 24500,
    transferLimits: { minAmount: 1, maxAmount: 1000000, currency: "EUR" },
    fees: [
      {
        method: "bankTransfer",
        fixedFee: 0.41,
        percentageFee: 0.43,
        description: "Bank transfer from your EUR account",
      },
      {
        method: "debitCard",
        fixedFee: 0,
        percentageFee: 1.5,
        description: "Debit card payment",
      },
    ],
    deliveryMethods: ["bankTransfer", "mobileWallet"],
    pros: [
      "Mid-market exchange rate",
      "Transparent fees",
      "Fast transfers (hours)",
      "Excellent mobile app",
      "No hidden markups",
    ],
    cons: [
      "Higher fee for card payments",
      "Limited cash pickup options",
      "Requires verification for large amounts",
    ],
  },
  remitly: {
    id: "remitly",
    name: "Remitly",
    brandColor: "primary",
    trustScore: 0.93,
    userRating: 4.5,
    websiteURL: "https://remitly.com",
    affiliateURL: null,
    description:
      "Remitly is an American online remittance service offering international money transfers to over 170 countries, with strong Philippines payout coverage.",
    reviewCount: 18200,
    transferLimits: { minAmount: 1, maxAmount: 500000, currency: "EUR" },
    fees: [
      {
        method: "bankTransfer",
        fixedFee: 1.99,
        percentageFee: 0,
        description: "Bank transfer",
      },
      {
        method: "mobileWallet",
        fixedFee: 0,
        percentageFee: 0,
        description: "GCash, Maya, or bank deposit",
      },
    ],
    deliveryMethods: ["bankTransfer", "cashPickup", "mobileWallet"],
    pros: [
      "Fastest for GCash",
      "No fees on mobile wallet transfers",
      "Promotional rates",
      "Good for regular senders",
    ],
    cons: [
      "Slightly lower exchange rates",
      "Markup on exchange rate",
      "Limited for large transfers",
    ],
  },
  "western-union": {
    id: "western-union",
    name: "Western Union",
    brandColor: "warning",
    trustScore: 0.95,
    userRating: 4.0,
    websiteURL: "https://westernunion.com",
    affiliateURL: null,
    description:
      "Western Union is an American financial services and communications company with the world's largest cash-pickup network for money transfers.",
    reviewCount: 32100,
    transferLimits: { minAmount: 1, maxAmount: 500000, currency: "EUR" },
    fees: [
      {
        method: "bankTransfer",
        fixedFee: 4.99,
        percentageFee: 0,
        description: "Bank transfer",
      },
      {
        method: "cashPickup",
        fixedFee: 9.99,
        percentageFee: 0,
        description: "Cash pickup at agent location",
      },
    ],
    deliveryMethods: ["bankTransfer", "cashPickup", "mobileWallet"],
    pros: [
      "Widest cash pickup network",
      "Instant cash pickup",
      "Available in most towns",
      "No bank account needed",
    ],
    cons: [
      "Higher fees",
      "Poorer exchange rates",
      "Markup baked into the rate",
      "Slower bank transfers",
    ],
  },
  transfergo: {
    id: "transfergo",
    name: "TransferGo",
    brandColor: "accent",
    trustScore: 0.88,
    userRating: 4.4,
    websiteURL: "https://transfergo.com",
    affiliateURL: null,
    description:
      "TransferGo is a European money transfer service focused on low fees for bank, cash, and mobile-wallet payouts, including GCash and Maya in the Philippines.",
    reviewCount: 9800,
    transferLimits: { minAmount: 1, maxAmount: 20000, currency: "EUR" },
    fees: [
      {
        method: "bankTransfer",
        fixedFee: 0,
        percentageFee: 0,
        description: "Bank transfer (fee varies by promotion)",
      },
      {
        method: "mobileWallet",
        fixedFee: 0,
        percentageFee: 0,
        description: "GCash or Maya payout",
      },
    ],
    deliveryMethods: ["bankTransfer", "mobileWallet"],
    pros: [
      "Frequent promotional rates for new customers",
      "Mobile wallet payout support",
      "No fee on many corridors",
    ],
    cons: [
      "Promotional pricing often replaces the standard rate — the no-promo price isn't always published",
      "Smaller transfer limits than larger competitors",
      "Less brand recognition",
    ],
  },
};

export function genericProviderDetail(id: string, name: string): ProviderDetail {
  return {
    id,
    name,
    brandColor: "text-tertiary",
    trustScore: 0,
    userRating: 0,
    websiteURL: "",
    affiliateURL: null,
    description: `We don't have a full profile for ${name} yet.`,
    reviewCount: 0,
    transferLimits: { minAmount: 0, maxAmount: 0, currency: "EUR" },
    fees: [],
    deliveryMethods: [],
    pros: [],
    cons: [],
  };
}
