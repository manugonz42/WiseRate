// Wise's own quote API (public, no key). Richer than the comparisons
// endpoint: per-pay-in payment options with real fees and delivery estimates.
// Canonical scenario: BANK_TRANSFER pay-in -> BANK_TRANSFER payout.

import type { TransferQuote } from "@/lib/models/types";
import { trustFor } from "../trust";

const QUOTES_URL = "https://api.wise.com/v3/quotes/";

interface WisePaymentOption {
  payIn: string;
  payOut: string;
  disabled?: boolean;
  fee: { total: number };
  targetAmount: number;
  formattedEstimatedDelivery?: string | null;
  estimatedDelivery?: string | null;
}

interface WiseDirectResponse {
  rate: number;
  paymentOptions: WisePaymentOption[];
}

export interface WiseDirectResult {
  quote: TransferQuote;
  rate: number; // Wise quotes at mid-market — usable as mid-market fallback
}

export async function fetchWiseDirect(
  from: string,
  to: string,
  amount: number,
): Promise<WiseDirectResult | null> {
  const res = await fetch(QUOTES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      sourceCurrency: from,
      targetCurrency: to,
      sourceAmount: amount,
    }),
    cache: "no-store", // aggregator holds its own 120 s TTL cache
  });
  if (!res.ok) throw new Error(`wise v3/quotes returned ${res.status}`);
  const data = (await res.json()) as WiseDirectResponse;

  const opt = data.paymentOptions.find(
    (o) => !o.disabled && o.payIn === "BANK_TRANSFER" && o.payOut === "BANK_TRANSFER",
  );
  if (!opt) return null;

  // estimatedDelivery is an ISO timestamp; distance from now -> maxMinutes.
  let maxMinutes = 0;
  if (opt.estimatedDelivery) {
    const delta = new Date(opt.estimatedDelivery).getTime() - Date.now();
    if (Number.isFinite(delta) && delta > 0) maxMinutes = Math.round(delta / 60_000);
  }
  const label =
    opt.formattedEstimatedDelivery && maxMinutes > 0
      ? opt.formattedEstimatedDelivery
      : "Not specified";

  return {
    rate: data.rate,
    quote: {
      id: "wise-direct",
      providerID: "wise",
      providerName: "Wise",
      providerIcon: "",
      sendAmount: amount,
      sendCurrency: from,
      receiveCurrency: to,
      exchangeRate: data.rate,
      fee: opt.fee.total,
      feeCurrency: from,
      receiveAmount: opt.targetAmount, // already (amount - fee) * rate
      deliveryEstimate: { minMinutes: 0, maxMinutes, label },
      deliveryMethod: "bankTransfer",
      markup: 0, // filled by the aggregator against the mid-market ref
      isPromotion: false,
      trustScore: trustFor("wise"),
      isMidMarketReference: false,
      source: "direct",
    },
  };
}
