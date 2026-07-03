import type { HistoricalRate } from "@/lib/models/types";

export interface RateStats {
  high: number;
  low: number;
  average: number;
  changePct: number; // signed, first -> last over the series
}

// Pure so it's unit-testable without mocking fetch.
export function computeStats(rates: HistoricalRate[]): RateStats | null {
  if (rates.length === 0) return null;

  const values = rates.map((r) => r.rate);
  const high = Math.max(...values);
  const low = Math.min(...values);
  const average = values.reduce((sum, v) => sum + v, 0) / values.length;

  const first = values[0];
  const last = values[values.length - 1];
  const changePct = first === 0 ? 0 : ((last - first) / first) * 100;

  return { high, low, average, changePct };
}
