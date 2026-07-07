import { afterEach, describe, expect, it, vi } from "vitest";
import type { TransferQuote } from "@/lib/models/types";

const quote = (source: TransferQuote["source"]): TransferQuote => ({
  id: source,
  providerID: source,
  providerName: source,
  providerIcon: "",
  sendAmount: 500,
  sendCurrency: "EUR",
  receiveCurrency: "PHP",
  exchangeRate: 60,
  fee: 1,
  feeCurrency: "EUR",
  receiveAmount: 29999,
  deliveryEstimate: { minMinutes: 60, maxMinutes: 60, label: "1 hour" },
  deliveryMethod: "bankTransfer",
  markup: 0,
  isPromotion: false,
  trustScore: 0.9,
  isMidMarketReference: false,
  source,
});

describe("filterExcludedProviders", () => {
  it("drops banks without a referral program (T22 audit)", async () => {
    const { filterExcludedProviders } = await import("../quotes");
    const quotes = [
      quote("wise-comparisons"),
      { ...quote("wise-comparisons"), providerID: "abn-amro-bank" },
      { ...quote("wise-comparisons"), providerID: "bnp" },
      { ...quote("wise-comparisons"), providerID: "unicredit" },
      { ...quote("wise-comparisons"), providerID: "wells-fargo" },
      { ...quote("wise-comparisons"), providerID: "hsbc-australia" },
      { ...quote("wise-comparisons"), providerID: "instarem" },
    ];
    expect(filterExcludedProviders(quotes).map((q) => q.providerID)).toEqual([
      "wise-comparisons",
      "instarem",
    ]);
  });
});

describe("stripMockInProduction", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("filters out mock quotes when NODE_ENV=production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { stripMockInProduction } = await import("../quotes");
    const quotes = [quote("direct"), quote("mock"), quote("wise-comparisons")];
    expect(stripMockInProduction(quotes).map((q) => q.source)).toEqual([
      "direct",
      "wise-comparisons",
    ]);
  });

  it("keeps mock quotes outside production", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const { stripMockInProduction } = await import("../quotes");
    const quotes = [quote("direct"), quote("mock")];
    expect(stripMockInProduction(quotes).map((q) => q.source)).toEqual([
      "direct",
      "mock",
    ]);
  });
});
