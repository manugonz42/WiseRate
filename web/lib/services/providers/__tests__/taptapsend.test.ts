// Fixture is a real response (captured 2026-07-22) trimmed to the 5 canonical
// sending countries (ES/GB/US/CA/AU) with their PHP corridors, plus GB→PKR
// (tiered feeSchedule) and GB→ARS (standard flat fee) to exercise the solver.
// 330 KB full response not committed.
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
    expect(quote!.exchangeRate).toBe(43.0);
    expect(quote!.receiveAmount).toBe(43000.0);
  });

  it("resolves a tiered feeSchedule: GBP→PKR 1000 lands in the fee-free tier", () => {
    // Tiers: 0.99 from 0.00, 0.00 from 125.00 → 1000 ≥ 125 so fee is 0.
    const quote = parseTapTapSend(fixture, "GBP", "PKR", 1000);
    expect(quote).not.toBeNull();
    expect(quote!.fee).toBe(0);
    expect(quote!.exchangeRate).toBe(373.75);
    expect(quote!.receiveAmount).toBeCloseTo(373750, 2);
  });

  it("resolves a tiered feeSchedule below the free threshold", () => {
    // 100 - 0.99 = 99.01 ≥ 0.00 but < 125.00 → tier 1 fee 0.99 applies.
    const quote = parseTapTapSend(fixture, "GBP", "PKR", 100);
    expect(quote!.fee).toBeCloseTo(0.99, 5);
    expect(quote!.receiveAmount).toBeCloseTo(99.01 * 373.75, 1);
  });

  it("resolves a standard flat-fee schedule: GBP→ARS 1000 charges 1.99", () => {
    const quote = parseTapTapSend(fixture, "GBP", "ARS", 1000);
    expect(quote).not.toBeNull();
    expect(quote!.fee).toBeCloseTo(1.99, 5);
    expect(quote!.receiveAmount).toBeCloseTo(998.01 * 2080, 1);
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
