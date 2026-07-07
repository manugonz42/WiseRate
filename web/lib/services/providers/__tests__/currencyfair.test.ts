import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseCurrencyFair } from "../currencyfair";

const fixture = JSON.parse(
  readFileSync(
    path.join(__dirname, "../__fixtures__/currencyfair.eur-php-1000.json"),
    "utf-8",
  ),
);

describe("parseCurrencyFair", () => {
  it("parses the live fixture into a valid quote", () => {
    const quote = parseCurrencyFair(fixture, "EUR", "PHP", 1000);
    expect(quote).not.toBeNull();

    expect(quote!.providerID).toBe("currencyfair");
    expect(quote!.providerName).toBe("CurrencyFair");
    expect(quote!.exchangeRate).toBe(69.85);
    expect(quote!.receiveAmount).toBeCloseTo(69849.2, 1);
    expect(quote!.deliveryMethod).toBe("bankTransfer");

    for (const value of [
      quote!.exchangeRate,
      quote!.fee,
      quote!.receiveAmount,
      quote!.deliveryEstimate.minMinutes,
      quote!.deliveryEstimate.maxMinutes,
      quote!.markup,
      quote!.trustScore,
    ]) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("derives a small non-negative send-currency fee from amount vs. receiveAmount/rate", () => {
    const quote = parseCurrencyFair(fixture, "EUR", "PHP", 1000);
    expect(quote!.fee).toBeGreaterThanOrEqual(0);
    expect(quote!.fee).toBeLessThan(1);
  });

  it("returns null when the currencyFair leg is missing", () => {
    expect(parseCurrencyFair({}, "EUR", "PHP", 1000)).toBeNull();
  });
});
