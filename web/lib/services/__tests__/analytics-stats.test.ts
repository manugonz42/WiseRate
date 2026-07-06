import { describe, expect, it } from "vitest";
import { computeStats } from "../analytics-stats";
import type { HistoricalRate } from "@/lib/models/types";

const series: HistoricalRate[] = [
  { date: "2026-06-25", rate: 64.0 },
  { date: "2026-06-26", rate: 65.5 },
  { date: "2026-06-27", rate: 63.5 },
  { date: "2026-06-28", rate: 66.0 },
];

describe("computeStats", () => {
  it("returns null for an empty series", () => {
    expect(computeStats([])).toBeNull();
  });

  it("computes high/low from the series", () => {
    const stats = computeStats(series);
    expect(stats?.high).toBe(66.0);
    expect(stats?.low).toBe(63.5);
  });

  it("computes the average of all points", () => {
    const stats = computeStats(series);
    expect(stats?.average).toBeCloseTo(64.75, 4);
  });

  it("computes signed % change first -> last", () => {
    const stats = computeStats(series);
    expect(stats?.changePct).toBeCloseTo(3.125, 4);
  });

  it("returns a negative % change when the series falls", () => {
    const falling: HistoricalRate[] = [
      { date: "2026-06-25", rate: 66.0 },
      { date: "2026-06-26", rate: 64.0 },
    ];
    const stats = computeStats(falling);
    expect(stats?.changePct).toBeCloseTo(-3.0303, 4);
  });

  it("handles a single-point series with 0% change", () => {
    const stats = computeStats([{ date: "2026-06-25", rate: 65.0 }]);
    expect(stats).toEqual({ high: 65.0, low: 65.0, average: 65.0, changePct: 0 });
  });
});
