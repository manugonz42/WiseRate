// Remitly public calculator (no key). The estimate carries BOTH the
// new-customer promo (boosted FX rate, fee waived) and the standard price
// (base_rate + total fee), so the quote's base fields are the standard price
// and the promo goes in `promo` — ranking stays fair for repeat senders.
//
// Remitly charges the fee on top of the send amount, so the standard price is
// normalized: receiveAmount = (amount - fee) * base_rate.

import type { TransferQuote } from "@/lib/models/types";
import { trustFor } from "../trust";

const ESTIMATE_URL = "https://api.remitly.io/v3/calculator/estimate";

interface RemitlyEstimate {
  exchange_rate?: {
    base_rate?: string;
    promotional_exchange_rate?: string | null;
  };
  fee?: { total_fee_amount?: string };
  discount?: { fee_discount_amount?: string; send_discount_amount?: string };
  receive_amount?: string;
}

interface RemitlyResponse {
  estimate?: RemitlyEstimate;
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
    conduit: "ESP:EUR-PHL:PHP",
    anchor: "SEND",
    amount: String(amount),
    purpose: "OTHER",
    customer_segment: "UNRECOGNIZED",
    strict_promo: "false",
  });
  return {
    url: `${ESTIMATE_URL}?${params}`,
    init: {
      headers: { Accept: "application/json" },
      cache: "no-store", // aggregator holds its own 120 s TTL cache
    },
  };
}

export function parseRemitly(
  json: unknown,
  from: string,
  to: string,
  amount: number,
): TransferQuote | null {
  const data = json as RemitlyResponse;
  const est = data?.estimate;
  if (!est) return null;

  const baseRate = num(est.exchange_rate?.base_rate);
  if (baseRate <= 0) return null;

  const feeStd = num(est.fee?.total_fee_amount);
  const feeDiscount = num(est.discount?.fee_discount_amount);
  const promoRate = est.exchange_rate?.promotional_exchange_rate
    ? num(est.exchange_rate.promotional_exchange_rate)
    : null;

  // Standard (no-promo) price, normalized to "sender pays `amount` total".
  const receiveStandard = (amount - feeStd) * baseRate;

  const hasPromo = (promoRate !== null && promoRate > baseRate) || feeDiscount > 0;
  const promoFee = Math.max(0, feeStd - feeDiscount);
  // receive_amount already reflects the promo (incl. its cap); deduct any
  // remaining non-waived fee at the promo rate to keep the same normalization.
  const promoReceive =
    num(est.receive_amount) - promoFee * (promoRate ?? baseRate);

  return {
    id: "remitly-direct",
    providerID: "remitly", // matches the Wise comparisons alias
    providerName: "Remitly",
    providerIcon: "",
    sendAmount: amount,
    sendCurrency: from,
    receiveCurrency: to,
    exchangeRate: baseRate,
    fee: feeStd,
    feeCurrency: from,
    receiveAmount: receiveStandard,
    deliveryEstimate: { minMinutes: 0, maxMinutes: 0, label: "Not specified" },
    deliveryMethod: "bankTransfer",
    markup: 0, // filled by the aggregator
    isPromotion: hasPromo,
    promo: hasPromo
      ? {
          description:
            promoRate !== null && promoRate > baseRate
              ? "New-customer offer: boosted rate" +
                (feeDiscount >= feeStd && feeStd > 0 ? " + fee waived" : "")
              : "New-customer offer: fee waived",
          promoFee,
          promoReceiveAmount: promoReceive,
          promoExchangeRate: promoRate,
          baseIsStandard: true,
        }
      : undefined,
    trustScore: trustFor("remitly"),
    isMidMarketReference: false,
    source: "direct",
  };
}

export async function fetchRemitly(
  from: string,
  to: string,
  amount: number,
): Promise<TransferQuote | null> {
  if (from !== "EUR" || to !== "PHP") return null;

  const { url, init } = buildRequest(from, to, amount);
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`remitly estimate returned ${res.status}`);
  const data = await res.json();
  return parseRemitly(data, from, to, amount);
}
