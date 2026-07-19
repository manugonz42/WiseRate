// Fixture is the real EUR→PHP/1000 response (verified live 2026-07-19).
// GBP/USD/CAD cases use inline objects — one call per corridor, shape identical.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseSendwave } from "../sendwave";

const fixture = JSON.parse(
  readFileSync(
    path.join(__dirname, "../__fixtures__/sendwave.eur-php-1000.json"),
    "utf-8",
  ),
);

describe("parseSendwave", () => {
  it("parses EUR→PHP 1000 with promo into a valid quote", () => {
    const quote = parseSendwave(fixture, "EUR", "PHP", 1000);
    expect(quote).not.toBeNull();

    expect(quote!.providerID).toBe("sendwave");
    expect(quote!.providerName).toBe("Sendwave");
    expect(quote!.exchangeRate).toBeCloseTo(69.91542, 4);
    expect(quote!.fee).toBeCloseTo(0.99, 4);
    expect(quote!.deliveryMethod).toBe("bankTransfer");
    expect(quote!.source).toBe("direct");

    for (const value of [
      quote!.exchangeRate,
      quote!.fee,
      quote!.receiveAmount,
      quote!.markup,
      quote!.trustScore,
    ]) {
      expect(Number.isFinite(value)).toBe(true);
    }
  });

  it("normalizes receiveAmount as (amount - fee) × baseRate", () => {
    const quote = parseSendwave(fixture, "EUR", "PHP", 1000);
    expect(quote!.receiveAmount).toBeCloseTo((1000 - 0.99) * 69.91542, 2);
  });

  it("detects promo: base fields are standard price, promo fields hold the boosted rate", () => {
    const quote = parseSendwave(fixture, "EUR", "PHP", 1000);
    expect(quote!.isPromotion).toBe(true);
    expect(quote!.promo).toBeDefined();
    expect(quote!.promo!.kind).toBe("first-transfer");
    expect(quote!.promo!.description).toBe("Intro Rate Discount");
    expect(quote!.promo!.baseIsStandard).toBe(true);
    expect(quote!.promo!.promoExchangeRate).toBeCloseTo(70.26746, 4);
    expect(quote!.promo!.promoReceiveAmount).toBeCloseTo((1000 - 0.99) * 70.26746, 2);
    // Standard rate must be lower than the promo rate.
    expect(quote!.exchangeRate).toBeLessThan(quote!.promo!.promoExchangeRate!);
  });

  it("sets isPromotion=false when campaignsApplied is empty", () => {
    const noPromo = { ...fixture, campaignsApplied: [] };
    const quote = parseSendwave(noPromo, "EUR", "PHP", 1000);
    expect(quote!.isPromotion).toBe(false);
    expect(quote!.promo).toBeUndefined();
  });

  it("parses a GBP corridor response correctly", () => {
    const gbp = {
      baseExchangeRate: "82.50000",
      effectiveExchangeRate: "82.50000",
      baseFeeAmount: "0.99",
      campaignsApplied: [],
    };
    const quote = parseSendwave(gbp, "GBP", "PHP", 500);
    expect(quote).not.toBeNull();
    expect(quote!.sendCurrency).toBe("GBP");
    expect(quote!.exchangeRate).toBeCloseTo(82.5, 3);
    expect(quote!.receiveAmount).toBeCloseTo((500 - 0.99) * 82.5, 2);
  });

  it("returns null on an empty response", () => {
    expect(parseSendwave({}, "EUR", "PHP", 1000)).toBeNull();
  });

  it("returns null when baseExchangeRate is zero or missing", () => {
    expect(parseSendwave({ baseExchangeRate: "0", baseFeeAmount: "0.99", campaignsApplied: [] }, "EUR", "PHP", 1000)).toBeNull();
  });
});
