// TransferGo public booking quotes (no key). Returns one option per
// pay-in x payout pair (incl. PH wallets) with fee, rate and receive amount.
// Canonical scenario: bank pay-in; best receive amount among available payouts.
//
// Caveat: when TransferGo applies its promotional FX discount it does NOT
// publish the standard rate, so the quote's base fields ARE the promo price
// (`promo.baseIsStandard = false`) — flagged in the UI.

import type { DeliveryMethod, TransferQuote } from "@/lib/models/types";
import { trustFor } from "../trust";

const QUOTES_URL = "https://my.transfergo.com/api/booking/quotes";

interface TgMoney {
  value: string;
  currency: string;
}

interface TgOption {
  code: string;
  availability?: { isAvailable?: boolean };
  payIn?: { code?: string };
  payOut?: { code?: string };
  fee?: { value?: string; valueBeforeDiscount?: string };
  rate?: { value?: string };
  sendingAmount?: TgMoney;
  receivingAmount?: TgMoney;
  promotion?: { isApplied?: boolean; isFxDiscountApplied?: boolean };
  visibility?: { estimateLabel?: string | null };
}

interface TgResponse {
  options?: TgOption[];
}

const PAYOUT_METHOD: Record<string, DeliveryMethod> = {
  bank: "bankTransfer",
  phWallet: "mobileWallet",
  wallet: "mobileWallet",
  cash: "cashPickup",
  card: "debitCard",
};

// e.g. "in_one_business_day" -> "1 business day"
const humanizeEstimate = (label: string | null | undefined): string => {
  if (!label) return "Not specified";
  return label
    .replace(/^in_/, "")
    .replace(/_/g, " ")
    .replace(/\bone\b/, "1")
    .replace(/\btwo\b/, "2")
    .replace(/\bthree\b/, "3");
};

export async function fetchTransferGo(
  from: string,
  to: string,
  amount: number,
): Promise<TransferQuote | null> {
  if (from !== "EUR" || to !== "PHP") return null;

  const params = new URLSearchParams({
    fromCurrencyCode: from,
    toCurrencyCode: to,
    fromCountryCode: "ES",
    toCountryCode: "PH",
    amount: String(amount),
    calculationBase: "sendAmount",
  });
  const res = await fetch(`${QUOTES_URL}?${params}`, {
    headers: { Accept: "application/json" },
    cache: "no-store", // aggregator holds its own 120 s TTL cache
  });
  if (!res.ok) throw new Error(`transfergo quotes returned ${res.status}`);
  const data = (await res.json()) as TgResponse;

  const candidates = (data.options ?? []).filter(
    (o) =>
      o.availability?.isAvailable !== false &&
      o.payIn?.code === "bank" &&
      parseFloat(o.receivingAmount?.value ?? "") > 0,
  );
  if (candidates.length === 0) return null;

  const best = candidates.reduce((a, b) =>
    parseFloat(b.receivingAmount!.value) > parseFloat(a.receivingAmount!.value)
      ? b
      : a,
  );

  const fee = parseFloat(best.fee?.value ?? "0") || 0;
  const rate = parseFloat(best.rate?.value ?? "0") || 0;
  const receiveAmount = parseFloat(best.receivingAmount!.value);
  const promoApplied = best.promotion?.isApplied === true;
  const feeBeforeDiscount = parseFloat(best.fee?.valueBeforeDiscount ?? "") || fee;

  return {
    id: `transfergo-${best.code}`,
    providerID: "transfergo",
    providerName: "TransferGo",
    providerIcon: "",
    sendAmount: amount,
    sendCurrency: from,
    receiveCurrency: to,
    exchangeRate: rate,
    fee,
    feeCurrency: from,
    receiveAmount,
    deliveryEstimate: {
      minMinutes: 0,
      maxMinutes: 0,
      label: humanizeEstimate(best.visibility?.estimateLabel),
    },
    deliveryMethod: PAYOUT_METHOD[best.payOut?.code ?? ""] ?? "bankTransfer",
    markup: 0, // filled by the aggregator
    isPromotion: promoApplied,
    promo: promoApplied
      ? {
          description:
            "Promotional pricing (new customers, capped); standard rate not published",
          promoFee: fee,
          promoReceiveAmount: receiveAmount,
          promoExchangeRate: rate,
          baseIsStandard: !best.promotion?.isFxDiscountApplied && feeBeforeDiscount === fee,
        }
      : undefined,
    trustScore: trustFor("transfergo"),
    isMidMarketReference: false,
    source: "direct",
  };
}
