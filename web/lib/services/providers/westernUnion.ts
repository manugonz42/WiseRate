// Western Union price catalog (public, no key). One POST returns every
// service (000 Money In Minutes / 500 Direct to Bank / 800 Mobile Money)
// crossed with every pay-in (EB bank, CC card, AP/GP wallets...).
// Default scenario: service 500 (Direct to Bank) x fund-in EB (bank); the
// delivery-method filter picks a different service group (see SERVICE_BY_METHOD).
//
// WU charges the fee on top (gross_amount = send + fee), so the quote is
// normalized: receiveAmount = (amount - fee) * rate — "sender pays exactly
// `amount` in total", per docs/services/exchange-rate.md.

import type { DeliveryMethod, TransferQuote } from "@/lib/models/types";
import { trustFor } from "../trust";

const CATALOG_URL = "https://www.westernunion.com/wuconnect/prices/catalog";

// WU exposes one price per delivery method as a distinct service group.
// Methods absent here (homeDelivery, debitCard) have no WU service group for
// this corridor → no quote (the aggregator falls back to the comparisons row).
const SERVICE_BY_METHOD: Partial<Record<DeliveryMethod, string>> = {
  bankTransfer: "500", // Direct to Bank
  cashPickup: "000", // Money In Minutes
  mobileWallet: "800", // Mobile Money Transfer
};

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

export function buildRequest(
  from: string,
  to: string,
  amount: number,
): { url: string; init?: RequestInit } {
  return {
    url: CATALOG_URL,
    init: {
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
    },
  };
}

export function parseWesternUnion(
  json: unknown,
  from: string,
  to: string,
  amount: number,
  method: DeliveryMethod = "bankTransfer",
): TransferQuote | null {
  const data = json as WuCatalogResponse;
  if (!data) return null;

  const service = SERVICE_BY_METHOD[method];
  if (!service) return null; // WU doesn't offer this method for the corridor

  const bank = data.services_groups?.find((s) => s.service === service);
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
    deliveryMethod: method,
    markup: 0, // filled by the aggregator
    isPromotion: false,
    trustScore: trustFor("western-union"),
    isMidMarketReference: false,
    source: "direct",
  };
}

export async function fetchWesternUnion(
  from: string,
  to: string,
  amount: number,
  method: DeliveryMethod = "bankTransfer",
): Promise<TransferQuote | null> {
  // Corridor-specific request body; only ES(EUR) -> PH(PHP) wired for now.
  if (from !== "EUR" || to !== "PHP") return null;

  const { url, init } = buildRequest(from, to, amount);
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`wu prices/catalog returned ${res.status}`);
  const data = await res.json();
  return parseWesternUnion(data, from, to, amount, method);
}
