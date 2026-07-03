import type { HistoryRange, HistoryResponse } from "@/lib/models/types";

// Range -> Frankfurter date window, pure so it's unit-testable without
// mocking `fetch`/`Date.now()`. `today` is injectable for deterministic
// tests; defaults to the real clock.
export function rangeToDateWindow(
  range: HistoryRange,
  today: Date = new Date(),
): { start: string; end: string } {
  const start = new Date(today);

  switch (range) {
    case "7D":
      start.setUTCDate(start.getUTCDate() - 7);
      break;
    case "30D":
      start.setUTCDate(start.getUTCDate() - 30);
      break;
    case "3M":
      start.setUTCMonth(start.getUTCMonth() - 3);
      break;
    case "6M":
      start.setUTCMonth(start.getUTCMonth() - 6);
      break;
    case "1Y":
      start.setUTCFullYear(start.getUTCFullYear() - 1);
      break;
  }

  return { start: toISODate(start), end: toISODate(today) };
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Client-side wrapper over the /api/history proxy.
export async function getHistory(
  range: HistoryRange,
  from = "EUR",
  to = "PHP",
): Promise<HistoryResponse> {
  const res = await fetch(
    `/api/history?from=${from}&to=${to}&range=${range}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`history request failed (${res.status})`);
  }
  return (await res.json()) as HistoryResponse;
}
