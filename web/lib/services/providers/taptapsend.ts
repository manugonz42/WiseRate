// Taptap Send public fxRates endpoint — same headers its own widget uses.
// One call returns all corridors; parser filters to the requested (from, to).
// Rate is per corridor (not per send amount); flat-fee schedule bundled in
// the same response. Endpoint without headers → 400 BAD_HEADER.
// Documented in docs/services/exchange-rate.md source table.

import type { TransferQuote } from "@/lib/models/types";
import { trustFor } from "../trust";

const RATES_URL = "https://api.taptapsend.com/api/fxRates";
// Widget request header — versioned 2026-07-19; update constant if endpoint returns 400.
const APPIAN_VERSION = "web/2022-05-03.0";

// Canonical sending country per currency (verified 2026-07-19; EUR rows are
// identical across sender countries so ES is the canonical pick).
const COUNTRY_BY_CURRENCY: Record<string, string> = {
  EUR: "ES",
  GBP: "GB",
  USD: "US",
  CAD: "CA",
  AUD: "AU",
};

interface TtsTier {
  fromAmount: string;
  toAmount: string | null;
  fee: string;
}

interface TtsFeeSchedule {
  tiers: TtsTier[];
}

interface TtsCorridor {
  destCurrencyCode: string;
  fxRate: string;
  currencyScale: number;
  feeSchedule?: TtsFeeSchedule;
}

interface TtsCountry {
  countryCode: string;
  corridors: TtsCorridor[];
}

interface TtsResponse {
  availableCountries: TtsCountry[];
}

// Flat-fee solver: returns the transfer amount X' such that X' + flatFee(X') = totalAmount.
// Works for fee schedules with a flat fee per tier. All PH corridors have fee 0 today —
// solver runs but always returns totalAmount unchanged.
function solveTransferAmount(schedule: TtsFeeSchedule, totalAmount: number): number {
  for (const tier of schedule.tiers) {
    const fee = parseFloat(tier.fee);
    const candidate = totalAmount - fee;
    const from = parseFloat(tier.fromAmount);
    const to = tier.toAmount !== null ? parseFloat(tier.toAmount) : Infinity;
    if (candidate >= from && candidate <= to) return Math.max(0, candidate);
  }
  return totalAmount;
}

export function buildRequest(): { url: string; init: RequestInit } {
  return {
    url: RATES_URL,
    init: {
      method: "GET",
      headers: {
        "Appian-Version": APPIAN_VERSION,
        "X-Device-Id": "web",
        "X-Device-Model": "web",
      },
      cache: "no-store",
    },
  };
}

export function parseTapTapSend(
  json: unknown,
  from: string,
  to: string,
  amount: number,
): TransferQuote | null {
  const data = json as TtsResponse;
  const sourceCountry = COUNTRY_BY_CURRENCY[from];
  if (!sourceCountry) return null;

  const countryEntry = data?.availableCountries?.find(
    (c) => c.countryCode === sourceCountry,
  );
  if (!countryEntry) return null;

  const corridor = countryEntry.corridors?.find(
    (c) => c.destCurrencyCode === to,
  );
  if (!corridor) return null;

  const rate = parseFloat(corridor.fxRate);
  if (!rate || rate <= 0) return null;

  const transferAmount = corridor.feeSchedule
    ? solveTransferAmount(corridor.feeSchedule, amount)
    : amount;
  const fee = Math.max(0, amount - transferAmount);
  const scale = corridor.currencyScale ?? 2;
  const receiveAmount = Math.round(transferAmount * rate * 10 ** scale) / 10 ** scale;

  return {
    id: "taptapsend-direct",
    providerID: "taptapsend",
    providerName: "Taptap Send",
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
    markup: 0,
    isPromotion: false,
    trustScore: trustFor("taptapsend"),
    isMidMarketReference: false,
    source: "direct",
  };
}

export async function fetchTapTapSend(
  from: string,
  to: string,
  amount: number,
): Promise<TransferQuote | null> {
  if (!(from in COUNTRY_BY_CURRENCY) || to !== "PHP") return null;

  const { url, init } = buildRequest();
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`taptapsend fxRates returned ${res.status}`);
  const data = await res.json();
  return parseTapTapSend(data, from, to, amount);
}
