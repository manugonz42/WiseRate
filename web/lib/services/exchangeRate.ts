import type { HistoricalRate, Rate, TimeFrame } from "@/lib/models";
import { generateHistoricalRates } from "@/lib/services/mockData";

// Swap-in point for the real Frankfurter impl (see docs/services/exchange-rate.md).
export interface ExchangeRateService {
  getRate(base: string, quote: string): Promise<Rate>;
  getHistory(base: string, quote: string, timeFrame: TimeFrame): Promise<HistoricalRate[]>;
}

const BASE_RATE = 63.5;

/** Mirrors iOS MockExchangeRateService: fixed 63.50 EUR→PHP with ±0.5 jitter. */
export class MockExchangeRateService implements ExchangeRateService {
  async getRate(base: string, quote: string): Promise<Rate> {
    const jitter = (Math.random() - 0.5); // ±0.5
    return {
      base,
      quote,
      rate: BASE_RATE + jitter,
      delta24h: 0.52,
      delta7d: -0.31,
      isStale: false,
      timestamp: Date.now(),
    };
  }

  async getHistory(_base: string, _quote: string, timeFrame: TimeFrame): Promise<HistoricalRate[]> {
    return generateHistoricalRates(timeFrame);
  }
}
