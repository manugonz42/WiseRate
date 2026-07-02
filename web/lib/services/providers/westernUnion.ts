// Western Union price catalog (public, no key). One POST returns every
// service (000 Money In Minutes / 500 Direct to Bank / 800 Mobile Money)
// crossed with every pay-in (EB bank, CC card, AP/GP wallets...).
// Canonical scenario: service 500 (Direct to Bank) x fund-in EB (bank).
//
// WU charges the fee on top (gross_amount = send + fee), so the quote is
// normalized: receiveAmount = (amount - fee) * rate — "sender pays exactly
// `amount` in total", per docs/services/exchange-rate.md.

import type { TransferQuote } from "@/lib/models/types";
import { trustFor } from "../trust";

const CATALOG_URL = "https://www.westernunion.com/wuconnect/prices/catalog";

interface WuPayGroup {
  fund_in: string;
  fx_rate: number;
  gross_fee: number;
  send_amount: number;
  receive_amount: number;
}

interface WuServiceGroup {
  service: string; // "000" | "500" | "800"
  service_name?: string;
  speed_days?: number;
  pay_groups?: WuPayGroup[];
}

interface WuCatalogResponse {
  response_status?: { status?: number };
  services_groups?: WuServiceGroup[];
}

export async function fetchWesternUnion(
  from: string,
  to: string,
  amount: number,
): Promise<TransferQuote | null> {
  // Corridor-specific request body; only ES(EUR) -> PH(PHP) wired for now.
  if (from !== "EUR" || to !== "PHP") return null;

  const res = await fetch(CATALOG_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      header_request: { version: "0.5", request_type: "PRICECATALOG" },
      sender: {
        client: "WUCOM",
        channel: "WWEB",
        funds_in: "*",
        curr_iso3: from,
        cty_iso2_ext: "ES",
        send_amount: amount,
      },
      receiver: { curr_iso3: to, cty_iso2_ext: "PH", cty_iso2: "PH" },
    }),
    cache: "no-store", // aggregator holds its own 120 s TTL cache
  });
  if (!res.ok) throw new Error(`wu prices/catalog returned ${res.status}`);
  const data = (await res.json()) as WuCatalogResponse;

  const bank = data.services_groups?.find((s) => s.service === "500");
  const pay = bank?.pay_groups?.find((p) => p.fund_in === "EB");
  if (!bank || !pay) return null;

  const receiveAmount = (amount - pay.gross_fee) * pay.fx_rate;
  if (receiveAmount <= 0) return null;

  const days = bank.speed_days ?? 0;
  const deliveryEstimate =
    days > 0
      ? {
          minMinutes: 0,
          maxMinutes: days * 24 * 60,
          label: days === 1 ? "1 day" : `${days} days`,
        }
      : { minMinutes: 0, maxMinutes: 0, label: "Not specified" };

  return {
    id: "western-union-direct",
    providerID: "western-union", // matches the Wise comparisons alias
    providerName: "Western Union",
    providerIcon: "",
    sendAmount: amount,
    sendCurrency: from,
    receiveCurrency: to,
    exchangeRate: pay.fx_rate,
    fee: pay.gross_fee,
    feeCurrency: from,
    receiveAmount,
    deliveryEstimate,
    deliveryMethod: "bankTransfer",
    markup: 0, // filled by the aggregator
    isPromotion: false,
    trustScore: trustFor("western-union"),
    isMidMarketReference: false,
    source: "direct",
  };
}
