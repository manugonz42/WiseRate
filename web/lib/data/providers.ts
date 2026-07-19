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
    subIdParam: "clickref", // Partnerize
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
    subIdParam: "fobs", // FlexOffers
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
    subIdParam: "clickref", // Partnerize
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
    subIdParam: "s_id", // FinanceAds
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
  // T19: profiles below researched via WebSearch 2026-07-06. Ratings/review
  // counts are from each provider's public Trustpilot page unless noted;
  // bank transferLimits.maxAmount is an editorial figure (banks don't publish
  // a hard per-transaction cap) reflecting typical unrestricted retail wire limits.
  instarem: {
    id: "instarem",
    name: "Instarem",
    brandColor: "primary",
    trustScore: 0.9,
    userRating: 4.4,
    websiteURL: "https://www.instarem.com",
    affiliateURL: null,
    subIdParam: "fobs", // FlexOffers (Partnerize is the fallback if declined)
    description:
      "Instarem (part of the Nium group) is a Singapore-founded fintech offering international transfers at a small FX margin with no fixed fee for bank-funded sends, plus wide cash-pickup coverage in the Philippines.",
    reviewCount: 7600,
    transferLimits: { minAmount: 1, maxAmount: 4500, currency: "EUR" },
    fees: [
      {
        method: "bankTransfer",
        fixedFee: 0,
        percentageFee: 0.6,
        description: "Bank transfer, FX margin only (0.37%–0.95%), no fixed fee",
      },
      {
        method: "debitCard",
        fixedFee: 0,
        percentageFee: 2.5,
        description: "Card payment (2–3% fee)",
      },
    ],
    deliveryMethods: ["bankTransfer", "cashPickup"],
    pros: [
      "FX margin under 1% on bank transfers",
      "No fixed fee for bank-funded sends",
      "21,000+ cash pickup locations in the Philippines",
      "Excellent Trustpilot rating (4.4/5)",
    ],
    cons: [
      "Cost-effectiveness drops above ~€4,500 per transfer",
      "Card payments cost 2–3%, much more than bank transfer",
      "Support can be slow to reach if something goes wrong",
    ],
  },
  monese: {
    id: "monese",
    name: "Monese",
    brandColor: "warning",
    trustScore: 0.7,
    userRating: 4.2,
    websiteURL: "https://monese.com",
    affiliateURL: null,
    description:
      "Monese is a UK/EU mobile banking app offering international transfers across roughly 35 mostly-EEA countries, with tiered pricing that drops from 2% down to free depending on your account plan.",
    reviewCount: 50700,
    transferLimits: { minAmount: 1, maxAmount: 40000, currency: "EUR" },
    fees: [
      {
        method: "bankTransfer",
        fixedFee: 3,
        percentageFee: 2,
        description: "Simple plan: 2% FX fee (min €3) plus a 1% weekend surcharge; cheaper on Classic (0.5%), free on Premium",
      },
    ],
    deliveryMethods: ["bankTransfer"],
    pros: [
      "Fee and rate shown up front in the app before you confirm",
      "Free transfers on the Premium plan",
      "App available in 14 languages",
    ],
    cons: [
      "Covers only ~35 countries, mostly EEA",
      "2% fee on the entry-level Simple plan, plus a weekend surcharge",
      "Some reports of account freezes blocking access to funds",
    ],
  },
  moneygram: {
    id: "moneygram",
    name: "MoneyGram",
    brandColor: "warning",
    trustScore: 0.85,
    userRating: 4.2,
    websiteURL: "https://www.moneygram.com",
    affiliateURL: null,
    subIdParam: "sid", // CJ Affiliate
    description:
      "MoneyGram is a US-based money transfer company with one of the largest cash-pickup and agent networks worldwide; the cost is concentrated in its exchange-rate margin rather than a visible fee.",
    reviewCount: 30000,
    transferLimits: { minAmount: 1, maxAmount: 9000, currency: "EUR" },
    fees: [
      {
        method: "bankTransfer",
        fixedFee: 0,
        percentageFee: 1.5,
        description: "Online transfer to bank account; cost is mostly the 1–2% exchange-rate margin on this corridor",
      },
      {
        method: "cashPickup",
        fixedFee: 5,
        percentageFee: 0,
        description: "Cash pickup at an agent location",
      },
    ],
    deliveryMethods: ["bankTransfer", "cashPickup"],
    pros: [
      "One of the largest cash-pickup and agent networks worldwide",
      "Cash pickup often available within minutes",
      "Long-established, widely recognized brand",
    ],
    cons: [
      "Exchange-rate margin isn't always clearly disclosed upfront",
      "1–2% FX margin on this corridor, costlier than digital-first challengers",
      "Complaints about refund handling and support responsiveness",
    ],
  },
  ofx: {
    id: "ofx",
    name: "OFX",
    brandColor: "success",
    trustScore: 0.9,
    userRating: 4.4,
    websiteURL: "https://www.ofx.com",
    affiliateURL: null,
    description:
      "OFX is an Australian-founded FX specialist built for larger, less frequent transfers: no transfer fee and no maximum amount, funded entirely through bank transfer.",
    reviewCount: 11000,
    transferLimits: { minAmount: 1000, maxAmount: 1000000, currency: "EUR" },
    fees: [
      {
        method: "bankTransfer",
        fixedFee: 0,
        percentageFee: 1,
        description: "No transfer fee; cost is the 0.5%–1.5% exchange-rate margin",
      },
    ],
    deliveryMethods: ["bankTransfer"],
    pros: [
      "No transfer fee, on any amount",
      "No maximum transfer limit — built for large transfers",
      "24/7 phone support across time zones",
      "Forward contracts and recurring transfers for FX planning",
    ],
    cons: [
      "$1,000 minimum — not built for small remittances",
      "Bank transfer only, no cash pickup or mobile wallet",
      "Account verification can take longer than app-first competitors",
    ],
  },
  paypal: {
    id: "paypal",
    name: "PayPal",
    brandColor: "accent",
    trustScore: 0.55,
    userRating: 1.5,
    websiteURL: "https://www.paypal.com",
    affiliateURL: null,
    description:
      "PayPal supports direct international transfers to bank accounts and other PayPal users, but its currency-conversion markup and per-transaction fee make it one of the costlier ways to send money — Xoom, PayPal's own dedicated remittance service, is usually cheaper for the same corridor.",
    reviewCount: 36900,
    transferLimits: { minAmount: 1, maxAmount: 55000, currency: "EUR" },
    fees: [
      {
        method: "bankTransfer",
        fixedFee: 0.99,
        percentageFee: 5,
        description: "International personal transfer, 5% fee (min $0.99, max $4.99), plus a 3–4% exchange-rate markup",
      },
    ],
    deliveryMethods: ["bankTransfer"],
    pros: [
      "Instant balance-to-balance transfers between PayPal accounts",
      "Buyer/seller protection on marketplace payments",
      "Most senders already have an account",
    ],
    cons: [
      "3–4% exchange-rate markup stacked on top of the transfer fee",
      "Far pricier for remittances than Wise, Remitly, or PayPal's own Xoom",
      "No cash pickup — bank account or PayPal balance only",
      "Trustpilot rating of 1.5/5 (36,900 reviews), driven largely by dispute-resolution complaints",
    ],
  },
  "world-remit": {
    id: "world-remit",
    name: "WorldRemit",
    brandColor: "accent",
    trustScore: 0.87,
    userRating: 4.1,
    websiteURL: "https://www.worldremit.com",
    affiliateURL: null,
    subIdParam: "clickref", // Awin
    description:
      "WorldRemit (Zepz group) is a UK-founded digital remittance service specializing in mobile-money and cash payouts across Africa, Asia, and Latin America, with strong Philippines coverage.",
    reviewCount: 71000,
    transferLimits: { minAmount: 1, maxAmount: 5000, currency: "EUR" },
    fees: [
      {
        method: "bankTransfer",
        fixedFee: 2,
        percentageFee: 0,
        description: "Flat transfer fee (typically $0.99–$3.99 depending on corridor), plus a 0.5%–3% FX markup",
      },
      {
        method: "mobileWallet",
        fixedFee: 1,
        percentageFee: 0,
        description: "Mobile money/wallet payout, usually the cheapest and fastest option",
      },
    ],
    deliveryMethods: ["bankTransfer", "cashPickup", "mobileWallet", "homeDelivery"],
    pros: [
      "Five payout options including mobile money and home delivery",
      "Cash and mobile payouts often arrive within minutes",
      "Highly rated mobile apps (4.6/5 Google Play, 4.8/5 App Store)",
    ],
    cons: [
      "FX markup of 0.5%–3% stacks on top of the flat fee",
      "Lower per-transaction limits for card-funded transfers",
      "Bank transfers can take up to 5 business days",
    ],
  },
  xoom: {
    id: "xoom",
    name: "Xoom",
    brandColor: "primary",
    trustScore: 0.86,
    userRating: 4.2,
    websiteURL: "https://www.xoom.com",
    affiliateURL: null,
    subIdParam: "clickref", // Awin
    description:
      "Xoom, a PayPal service, sends to Philippine banks, GCash, cash pickup, and home delivery, funded instantly from a PayPal balance, bank account, or card — fast, but the exchange-rate margin runs 3%–4% above mid-market.",
    reviewCount: 188500,
    transferLimits: { minAmount: 1, maxAmount: 46000, currency: "EUR" },
    fees: [
      {
        method: "bankTransfer",
        fixedFee: 0,
        percentageFee: 0,
        description: "Bank/GCash deposit via PayPal balance or bank account; fee often waived, cost is mainly the FX margin",
      },
      {
        method: "debitCard",
        fixedFee: 5,
        percentageFee: 0,
        description: "Card-funded transfer, average fee around $5",
      },
    ],
    deliveryMethods: ["bankTransfer", "cashPickup", "mobileWallet", "homeDelivery"],
    pros: [
      "Backed by PayPal's scale and fraud protection",
      "Often $0 transfer fee on eligible transfers",
      "Minutes-level delivery to GCash and major Philippine banks",
    ],
    cons: [
      "Exchange-rate margin of 3%–4% above mid-market",
      "One of the pricier options for larger sends",
      "True cost is hidden in the rate more than the fee",
    ],
  },
  // T38 (2026-07-19): direct source via api.taptapsend.com/api/fxRates (headers required).
  // Trustpilot 4.7/5 (~36,000 reviews) as of 2026-07-19. Fee 0 toward PH.
  // No affiliate program URL yet — direct program, contact via form + support@taptapsend.com.
  taptapsend: {
    id: "taptapsend",
    name: "Taptap Send",
    brandColor: "accent",
    trustScore: 0.9,
    userRating: 4.7,
    websiteURL: "https://taptapsend.com",
    affiliateURL: null,
    description:
      "Taptap Send is a UK-based remittance service offering zero-fee transfers to the Philippines and other corridors, with payout via bank deposit, GCash, or Maya. Rated 4.7/5 on Trustpilot (~36,000 reviews).",
    reviewCount: 36000,
    transferLimits: { minAmount: 1, maxAmount: 20000, currency: "EUR" },
    fees: [
      {
        method: "bankTransfer",
        fixedFee: 0,
        percentageFee: 0,
        description: "No transfer fee on PHP corridors; cost is the exchange-rate margin",
      },
      {
        method: "mobileWallet",
        fixedFee: 0,
        percentageFee: 0,
        description: "GCash or Maya payout, no fee",
      },
    ],
    deliveryMethods: ["bankTransfer", "mobileWallet"],
    pros: [
      "Zero fee toward the Philippines",
      "GCash and Maya payout supported",
      "Excellent Trustpilot rating (4.7/5, ~36,000 reviews)",
      "Covers EUR, GBP, USD, CAD, and AUD",
    ],
    cons: [
      "Smaller brand recognition than Wise or Remitly",
      "Exchange-rate margin not always the sharpest for large sends",
      "No cash pickup option",
    ],
  },
  // T22 (2026-07-06): direct source via api.currencyfair.com/comparisonQuotes
  // (see docs/plan/T22-quote-fidelity.md). Fee/limit facts from
  // businessexpert.co.uk's 2026-07-06 review; Trustpilot rating/count from
  // trustpilot.com/review/currencyfair.com, same date.
  currencyfair: {
    id: "currencyfair",
    name: "CurrencyFair",
    brandColor: "success",
    trustScore: 0.85,
    userRating: 4.5,
    websiteURL: "https://www.currencyfair.com",
    affiliateURL: null,
    subIdParam: "clickref", // Partnerize
    description:
      "CurrencyFair is an Ireland-based FX broker offering peer-to-peer and instant transfers at a small margin over mid-market, funded and paid out entirely through bank accounts — no cash pickup or mobile wallet.",
    reviewCount: 12100,
    transferLimits: { minAmount: 8, maxAmount: 1000000, currency: "EUR" },
    fees: [
      {
        method: "bankTransfer",
        fixedFee: 3,
        percentageFee: 0.3,
        description: "Flat transfer fee (~€3) plus a 0.25%–0.6% exchange-rate margin depending on marketplace vs. instant rate",
      },
    ],
    deliveryMethods: ["bankTransfer"],
    pros: [
      "Low, transparent flat fee plus a small FX margin",
      "No published maximum transfer limit",
      "Strong Trustpilot rating (4.5/5, ~12,100 reviews)",
    ],
    cons: [
      "Bank transfer only — no cash pickup or mobile wallet payout",
      "~€8 minimum, not built for the smallest sends",
      "KYC/source-of-funds checks can pause a first large transfer",
    ],
  },
};

// Outbound URL for send/claim CTAs — affiliateURL stays null until agreements
// are signed, falling back to the provider's site; null when we know neither.
export function providerSendURL(providerID: string): string | null {
  const p = PROVIDERS[providerID];
  return p ? (p.affiliateURL ?? (p.websiteURL || null)) : null;
}

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
