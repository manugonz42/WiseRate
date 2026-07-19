// Fixture is a real response trimmed to the 5 canonical sending countries
// (ES/GB/US/CA/AU) and their PHP corridors, plus one AUD→INR corridor with a
// tiered feeSchedule to exercise the flat-fee solver. 330 KB full response not
// committed — field names and structure verified against the live endpoint 2026-07-19.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseTapTapSend } from "../taptapsend";

const fixture = JSON.parse(
  readFileSync(
    path.join(__dirname, "../__fixtures__/taptapsend.eur-php-1000.json"),
    "utf-8",
  ),
);

describe("parseTapTapSend", () => {
  it("parses EUR→PHP 1000 into a valid quote with fee 0", () => {
    const quote = parseTapTapSend(fixture, "EUR", "PHP", 1000);
    expect(quote).not.toBeNull();

    expect(quote!.providerID).toBe("taptapsend");
    expect(quote!.providerName).toBe("Taptap Send");
    expect(quote!.exchangeRate).toBe(70.0);
    expect(quote!.fee).toBe(0);
    expect(quote!.receiveAmount).toBe(70000.0);
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

  it("parses GBP→PHP 1000", () => {
    const quote = parseTapTapSend(fixture, "GBP", "PHP", 1000);
    expect(quote).not.toBeNull();
    expect(quote!.exchangeRate).toBe(82.3);
    expect(quote!.fee).toBe(0);
    expect(quote!.receiveAmount).toBe(82300.0);
  });

  it("parses USD→PHP 1000", () => {
    const quote = parseTapTapSend(fixture, "USD", "PHP", 1000);
    expect(quote).not.toBeNull();
    expect(quote!.exchangeRate).toBe(61.0);
    expect(quote!.receiveAmount).toBe(61000.0);
  });

  it("parses CAD→PHP 1000", () => {
    const quote = parseTapTapSend(fixture, "CAD", "PHP", 1000);
    expect(quote).not.toBeNull();
    expect(quote!.exchangeRate).toBe(43.5);
    expect(quote!.receiveAmount).toBe(43500.0);
  });

  it("parses AUD→PHP 1000", () => {
    const quote = parseTapTapSend(fixture, "AUD", "PHP", 1000);
    expect(quote).not.toBeNull();
    expect(quote!.exchangeRate).toBe(42.7);
    expect(quote!.receiveAmount).toBe(42700.0);
  });

  it("resolves tiered feeSchedule: AUD 1000 total, tier 2 fee 1.99 applies", () => {
    // AUD→INR corridor has 3 tiers; 1000 - 1.99 = 998.01 falls in [200.01, 1000] → tier 2
    const quote = parseTapTapSend(fixture, "AUD", "INR", 1000);
    expect(quote).not.toBeNull();
    expect(quote!.fee).toBeCloseTo(1.99, 5);
    expect(quote!.exchangeRate).toBe(56.8);
    // receiveAmount = round(998.01 * 56.80 * 100) / 100
    expect(quote!.receiveAmount).toBeCloseTo(56686.97, 1);
  });

  it("returns null for an unknown destination currency (corridor not in fixture)", () => {
    expect(parseTapTapSend(fixture, "EUR", "IDR", 1000)).toBeNull();
  });

  it("returns null for an unsupported sending currency", () => {
    expect(parseTapTapSend(fixture, "ZAR", "PHP", 1000)).toBeNull();
  });

  it("returns null for an empty response", () => {
    expect(parseTapTapSend({}, "EUR", "PHP", 1000)).toBeNull();
  });
});
