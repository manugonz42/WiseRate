import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseWiseQuotes } from "../../wise";

const fixture = JSON.parse(
  readFileSync(
    path.join(__dirname, "../__fixtures__/wise.eur-php-1000.json"),
    "utf-8",
  ),
);

describe("parseWiseQuotes (comparisons)", () => {
  it("parses the live fixture into multiple quotes plus a mid-market rate", () => {
    const result = parseWiseQuotes(fixture, "EUR", "PHP", 1000);
    expect(result.quotes.length).toBeGreaterThan(1);
    expect(result.rate.rate).toBeGreaterThan(0);

    for (const quote of result.quotes) {
      expect(quote.providerID.length).toBeGreaterThan(0);
      expect(quote.providerName.length).toBeGreaterThan(0);
      expect(quote.source).toBe("wise-comparisons");
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
    }
  });

  it("stores markup as a 0..1 fraction (percentage / 100)", () => {
    const result = parseWiseQuotes(fixture, "EUR", "PHP", 1000);
    const wise = result.quotes.find((q) => q.providerID === "wise");
    expect(wise).toBeDefined();
    // Fixture's raw `markup` for the wise provider is 0 (the mid-market row).
    expect(wise!.markup).toBe(0);

    const withMarkup = result.quotes.find((q) => q.markup > 0);
    expect(withMarkup).toBeDefined();
    expect(withMarkup!.markup).toBeLessThan(1);
  });

  it("keeps the isConsideredMidMarketRate quote in the list and uses it as the rate reference", () => {
    const result = parseWiseQuotes(fixture, "EUR", "PHP", 1000);
    const wise = result.quotes.find((q) => q.providerID === "wise");
    expect(wise).toBeDefined();
    expect(result.rate.rate).toBe(wise!.exchangeRate);
  });

  it("returns an empty quote list (never NaN) on an empty response", () => {
    const result = parseWiseQuotes({}, "EUR", "PHP", 1000);
    expect(result.quotes).toEqual([]);
    expect(result.rate.rate).toBe(0);
  });
});
