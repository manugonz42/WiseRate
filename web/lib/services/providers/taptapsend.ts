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

// Tiered schedules list open-ended tiers by lower bound only; the applicable
// tier is the highest whose minValue the transfer amount reaches.
interface TtsTier {
  minValue: string;
  fee: string;
}

interface TtsFeeSchedule {
  type?: string;
  tiers?: TtsTier[];
  flatFee?: string;
  feePercent?: string; // whole percent, e.g. "1.00" = 1%
  maxFee?: string;
}

interface TtsCorridor {
  currency: string;
  fxRate: string;
  currencyScale: number;
  feeSchedule?: TtsFeeSchedule;
}

interface TtsCountry {
  isoCountryCode: string;
  corridors: TtsCorridor[];
}

interface TtsResponse {
  availableCountries: TtsCountry[];
}

// Fee solver: returns the transfer amount X' such that X' + fee(X') = totalAmount.
// PH corridors carry no feeSchedule at all today (fee 0), so this only runs if
// Taptap starts charging on PHP or the fetch is widened to other destinations.
function solveTransferAmount(schedule: TtsFeeSchedule, totalAmount: number): number {
  if (schedule.tiers?.length) {
    const tiers = [...schedule.tiers].sort(
      (a, b) => parseFloat(b.minValue) - parseFloat(a.minValue),
    );
    for (const tier of tiers) {
      const candidate = totalAmount - parseFloat(tier.fee);
      if (candidate >= parseFloat(tier.minValue)) return Math.max(0, candidate);
    }
    return totalAmount;
  }

  const flat = parseFloat(schedule.flatFee ?? "0") || 0;
  const pct = (parseFloat(schedule.feePercent ?? "0") || 0) / 100;
  let transfer = (totalAmount - flat) / (1 + pct);
  const maxFee = schedule.maxFee != null ? parseFloat(schedule.maxFee) : null;
  if (maxFee != null && totalAmount - transfer > maxFee) transfer = totalAmount - maxFee;
  return Math.max(0, transfer);
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
    (c) => c.isoCountryCode === sourceCountry,
  );
  if (!countryEntry) return null;

  const corridor = countryEntry.corridors?.find((c) => c.currency === to);
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
