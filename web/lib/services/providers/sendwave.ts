// Sendwave public pricing endpoint (Zepz group, official GCash partner).
// No auth required; quotes by exact send amount; separate baseExchangeRate
// (standard) and effectiveExchangeRate (promo with campaignsApplied).
// Ranking uses the standard price only (T22 rule); promo goes in PromoInfo.
// No AUD corridor on Sendwave → returns null for AUD (corredor ausente).
// Verified live 2026-07-19; see docs/plan/T39-sendwave-provider.md.

import type { TransferQuote } from "@/lib/models/types";
import { trustFor } from "../trust";

const PRICING_URL = "https://app.sendwave.com/v2/pricing-public";

// Canonical sending country per currency (lowercase, as Sendwave expects;
// verified 2026-07-19 via /v2/countries; AUD has no PH corridor).
const COUNTRY_BY_CURRENCY: Record<string, string> = {
  EUR: "es",
  GBP: "gb",
  USD: "us",
  CAD: "ca",
};

interface SwCampaign {
  code: string;
  description: string;
  adjustmentBps: number;
}

interface SwResponse {
  baseExchangeRate?: string;
  effectiveExchangeRate?: string;
  baseFeeAmount?: string;
  campaignsApplied?: SwCampaign[];
}

const num = (s: string | null | undefined): number => {
  const n = parseFloat(s ?? "");
  return Number.isFinite(n) ? n : 0;
};

export function buildRequest(
  from: string,
  to: string,
  amount: number,
): { url: string; init?: RequestInit } {
  const params = new URLSearchParams({
    amount: String(amount),
    amountType: "SEND",
    sendCountryIso2: COUNTRY_BY_CURRENCY[from] ?? from.toLowerCase().slice(0, 2),
    sendCurrency: from,
    receiveCountryIso2: "ph",
    receiveCurrency: to,
  });
  return {
    url: `${PRICING_URL}?${params}`,
    init: {
      headers: { "Accept-Language": "en" },
      cache: "no-store",
    },
  };
}

export function parseSendwave(
  json: unknown,
  from: string,
  to: string,
  amount: number,
): TransferQuote | null {
  const data = json as SwResponse;
  const baseRate = num(data?.baseExchangeRate);
  if (baseRate <= 0) return null;

  const fee = num(data?.baseFeeAmount);
  // Fee charged on top of the send amount; normalize to "sender pays amount total":
  const receiveAmount = (amount - fee) * baseRate;
  if (receiveAmount <= 0) return null;

  const campaigns = data?.campaignsApplied ?? [];
  const effectiveRate = num(data?.effectiveExchangeRate);
  const hasPromo = campaigns.length > 0 && effectiveRate > baseRate;
  const promoReceive = hasPromo ? (amount - fee) * effectiveRate : 0;

  return {
    id: "sendwave-direct",
    providerID: "sendwave",
    providerName: "Sendwave",
    providerIcon: "",
    sendAmount: amount,
    sendCurrency: from,
    receiveCurrency: to,
    exchangeRate: baseRate,
    fee,
    feeCurrency: from,
    receiveAmount,
    deliveryEstimate: { minMinutes: 0, maxMinutes: 0, label: "Not specified" },
    deliveryMethod: "bankTransfer",
    markup: 0,
    isPromotion: hasPromo,
    promo: hasPromo
      ? {
          kind: "first-transfer",
          description: campaigns[0].description,
          promoFee: fee,
          promoReceiveAmount: promoReceive,
          promoExchangeRate: effectiveRate,
          baseIsStandard: true,
        }
      : undefined,
    trustScore: trustFor("sendwave"),
    isMidMarketReference: false,
    source: "direct",
  };
}

export async function fetchSendwave(
  from: string,
  to: string,
  amount: number,
): Promise<TransferQuote | null> {
  if (!(from in COUNTRY_BY_CURRENCY) || to !== "PHP") return null;

  const { url, init } = buildRequest(from, to, amount);
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`sendwave pricing-public returned ${res.status}`);
  const data = await res.json();
  return parseSendwave(data, from, to, amount);
}
