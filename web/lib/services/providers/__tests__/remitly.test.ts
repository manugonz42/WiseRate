import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseRemitly } from "../remitly";

const fixture = JSON.parse(
  readFileSync(
    path.join(__dirname, "../__fixtures__/remitly.eur-php-1000.json"),
    "utf-8",
  ),
);

describe("parseRemitly", () => {
  it("parses the live fixture into a valid quote", () => {
    const quote = parseRemitly(fixture, "EUR", "PHP", 1000);
    expect(quote).not.toBeNull();

    expect(quote!.providerID).toBe("remitly");
    expect(quote!.providerName).toBe("Remitly");
    expect(quote!.exchangeRate).toBeGreaterThan(0);

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

  it("normalizes the base (standard) price as (amount - fee) * base_rate — fee charged on top", () => {
    const quote = parseRemitly(fixture, "EUR", "PHP", 1000);
    const expected = (1000 - quote!.fee) * quote!.exchangeRate;
    expect(quote!.receiveAmount).toBeCloseTo(expected, 2);
  });

  it("keeps the base fields as the standard price and puts the promo in `promo`", () => {
    const quote = parseRemitly(fixture, "EUR", "PHP", 1000);
    expect(quote!.isPromotion).toBe(true);
    expect(quote!.promo).toBeDefined();
    expect(quote!.promo!.baseIsStandard).toBe(true);
    // Standard rate (69.46) must not be the boosted promo rate (71.37).
    expect(quote!.exchangeRate).toBeLessThan(quote!.promo!.promoExchangeRate!);
  });

  it("returns null on an empty response instead of a NaN quote", () => {
    expect(parseRemitly({}, "EUR", "PHP", 1000)).toBeNull();
  });
});
