import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseWesternUnion } from "../westernUnion";

const fixture = JSON.parse(
  readFileSync(
    path.join(__dirname, "../__fixtures__/westernUnion.eur-php-1000.json"),
    "utf-8",
  ),
);

describe("parseWesternUnion", () => {
  it("parses the live fixture into a valid quote", () => {
    const quote = parseWesternUnion(fixture, "EUR", "PHP", 1000);
    expect(quote).not.toBeNull();

    expect(quote!.providerID).toBe("western-union");
    expect(quote!.providerName).toBe("Western Union");
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

  it("normalizes receiveAmount as (amount - fee) * rate — fee charged on top", () => {
    const quote = parseWesternUnion(fixture, "EUR", "PHP", 1000);
    const expected = (1000 - quote!.fee) * quote!.exchangeRate;
    expect(quote!.receiveAmount).toBeCloseTo(expected, 2);
  });

  it("returns null on an empty response instead of a NaN quote", () => {
    expect(parseWesternUnion({}, "EUR", "PHP", 1000)).toBeNull();
  });

  it("re-prices per delivery method — each maps to a distinct WU service", () => {
    const bank = parseWesternUnion(fixture, "EUR", "PHP", 1000, "bankTransfer");
    const cash = parseWesternUnion(fixture, "EUR", "PHP", 1000, "cashPickup");
    const wallet = parseWesternUnion(fixture, "EUR", "PHP", 1000, "mobileWallet");

    expect(bank!.deliveryMethod).toBe("bankTransfer");
    expect(cash!.deliveryMethod).toBe("cashPickup");
    expect(wallet!.deliveryMethod).toBe("mobileWallet");

    // Money In Minutes (000) carries a worse rate than Direct to Bank (500),
    // so selecting cash pickup genuinely changes the amount the recipient gets.
    expect(cash!.receiveAmount).not.toBeCloseTo(bank!.receiveAmount, 0);
  });

  it("returns null for a method WU has no service group for", () => {
    expect(parseWesternUnion(fixture, "EUR", "PHP", 1000, "homeDelivery")).toBeNull();
  });
});
