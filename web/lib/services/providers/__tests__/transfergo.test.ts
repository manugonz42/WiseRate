import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseTransferGo } from "../transfergo";

const fixture = JSON.parse(
  readFileSync(
    path.join(__dirname, "../__fixtures__/transfergo.eur-php-1000.json"),
    "utf-8",
  ),
);

describe("parseTransferGo", () => {
  it("parses the live fixture into a valid quote", () => {
    const quote = parseTransferGo(fixture, "EUR", "PHP", 1000);
    expect(quote).not.toBeNull();

    expect(quote!.providerID).toBe("transfergo");
    expect(quote!.providerName).toBe("TransferGo");
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

  it("flags the promo price as non-standard — TransferGo doesn't publish a no-promo rate", () => {
    const quote = parseTransferGo(fixture, "EUR", "PHP", 1000);
    expect(quote!.isPromotion).toBe(true);
    expect(quote!.promo).toBeDefined();
    expect(quote!.promo!.baseIsStandard).toBe(false);
  });

  it("returns null when no bank pay-in option is available", () => {
    expect(parseTransferGo({}, "EUR", "PHP", 1000)).toBeNull();
  });

  it("filters by delivery method — mobile wallet matches the fixture's payout", () => {
    const wallet = parseTransferGo(fixture, "EUR", "PHP", 1000, "mobileWallet");
    expect(wallet).not.toBeNull();
    expect(wallet!.deliveryMethod).toBe("mobileWallet");
  });

  it("returns null when the requested method has no matching payout", () => {
    // The fixture only carries a bank -> PH-wallet option, so a bank-transfer
    // payout filter finds nothing (aggregator falls back to comparisons).
    expect(parseTransferGo(fixture, "EUR", "PHP", 1000, "bankTransfer")).toBeNull();
  });
});
