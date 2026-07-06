import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseWiseDirect } from "../wiseDirect";

const fixture = JSON.parse(
  readFileSync(
    path.join(__dirname, "../__fixtures__/wiseDirect.eur-php-1000.json"),
    "utf-8",
  ),
);

describe("parseWiseDirect", () => {
  it("parses the live fixture into a valid quote", () => {
    const result = parseWiseDirect(fixture, "EUR", "PHP", 1000);
    expect(result).not.toBeNull();
    const { quote, rate } = result!;

    expect(quote.providerID).toBe("wise");
    expect(quote.providerName).toBe("Wise");
    expect(quote.exchangeRate).toBeGreaterThan(0);
    expect(rate).toBeGreaterThan(0);

    for (const value of [
      quote.exchangeRate,
      quote.fee,
      quote.receiveAmount,
      quote.deliveryEstimate.minMinutes,
      quote.deliveryEstimate.maxMinutes,
      quote.markup,
      quote.trustScore,
    ]) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("normalizes receiveAmount as the payment option's already-net targetAmount", () => {
    const result = parseWiseDirect(fixture, "EUR", "PHP", 1000);
    type RawPaymentOption = { disabled: boolean; payIn: string; payOut: string; targetAmount: number };
    const opt = (fixture as { paymentOptions: RawPaymentOption[] }).paymentOptions.find(
      (o) => !o.disabled && o.payIn === "BANK_TRANSFER" && o.payOut === "BANK_TRANSFER",
    );
    expect(result!.quote.receiveAmount).toBe(opt.targetAmount);
  });

  it("returns null on an empty response instead of a NaN quote", () => {
    expect(parseWiseDirect({}, "EUR", "PHP", 1000)).toBeNull();
  });
});
