// CurrencyFair public comparison-quote endpoint (no key) — the same call its
// own "us vs. your bank" calculator makes. Bank-to-bank only (no cash pickup /
// mobile wallet), per docs/proveedores.md.
//
// The endpoint returns the CurrencyFair leg's receiveAmount directly already
// net of its fee, but that fee is expressed as an absolute amount in the
// *target* currency (observed: a flat deduction that doesn't scale with send
// amount) rather than the source currency other parsers use. Rather than
// guess at its unit, we normalize by deriving an equivalent send-currency fee
// from the two numbers the API does give us: fee = amount - receiveAmount/rate.

import type { TransferQuote } from "@/lib/models/types";
import { trustFor } from "../trust";

const QUOTES_URL = "https://api.currencyfair.com/comparisonQuotes";

interface CfScaledAmount {
  amount: number;
  scale: number;
}
interface CfScaledRate {
  rate: number;
  scale: number;
}
interface CfLeg {
  transferFee: number;
  rateInfo: CfScaledRate;
  amountInfo: CfScaledAmount;
}
interface CfResponse {
  currencyFair?: CfLeg;
}

// rateInfo.rate arrives as a plain decimal already (`scale` is display
// precision, not a fixed-point divisor) — unlike amountInfo, which is
// integer fixed-point (e.g. 100000 @ scale 2 == 1000.00).
const scaledRate = (v: CfScaledRate | undefined): number => v?.rate ?? 0;
const scaledAmount = (v: CfScaledAmount | undefined): number =>
  v ? v.amount / 10 ** v.scale : 0;

export function buildRequest(
  from: string,
  to: string,
  amount: number,
): { url: string; init?: RequestInit } {
  return {
    url: QUOTES_URL,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        currencyFrom: from,
        currencyTo: to,
        amountInfo: { amount: Math.round(amount * 100), scale: 2 },
      }),
      cache: "no-store", // aggregator holds its own 120 s TTL cache
    },
  };
}

export function parseCurrencyFair(
  json: unknown,
  from: string,
  to: string,
  amount: number,
): TransferQuote | null {
  const data = json as CfResponse;
  const leg = data?.currencyFair;
  if (!leg) return null;

  const rate = scaledRate(leg.rateInfo);
  const receiveAmount = scaledAmount(leg.amountInfo);
  if (rate <= 0 || receiveAmount <= 0) return null;

  const fee = Math.max(0, amount - receiveAmount / rate);

  return {
    id: "currencyfair-direct",
    providerID: "currencyfair",
    providerName: "CurrencyFair",
    providerIcon: "",
    sendAmount: amount,
    sendCurrency: from,
    receiveCurrency: to,
    exchangeRate: rate,
    fee,
    feeCurrency: from,
    receiveAmount,
    deliveryEstimate: { minMinutes: 0, maxMinutes: 0, label: "Not specified" },
    deliveryMethod: "bankTransfer",
    markup: 0, // filled by the aggregator
    isPromotion: false,
    trustScore: trustFor("currencyfair"),
    isMidMarketReference: false,
    source: "direct",
  };
}

export async function fetchCurrencyFair(
  from: string,
  to: string,
  amount: number,
): Promise<TransferQuote | null> {
  if (from !== "EUR" || to !== "PHP") return null;

  const { url, init } = buildRequest(from, to, amount);
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`currencyfair comparisonQuotes returned ${res.status}`);
  const data = await res.json();
  return parseCurrencyFair(data, from, to, amount);
}
