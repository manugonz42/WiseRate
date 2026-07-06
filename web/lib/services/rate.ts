import type { QuotesResponse } from "@/lib/models/types";

// Client-side wrapper over the /api/quotes proxy.
export async function getQuotes(
  amount: number,
  from = "EUR",
  to = "PHP",
): Promise<QuotesResponse> {
  const res = await fetch(
    `/api/quotes?from=${from}&to=${to}&amount=${amount}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`quotes request failed (${res.status})`);
  }
  return (await res.json()) as QuotesResponse;
}
