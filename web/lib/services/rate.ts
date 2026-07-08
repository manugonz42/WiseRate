import type { DeliveryMethod, QuotesResponse } from "@/lib/models/types";

// Client-side wrapper over the /api/quotes proxy. `method` filters by delivery
// method; omit it (or pass undefined) for the best quote per provider.
export async function getQuotes(
  amount: number,
  method?: DeliveryMethod,
  from = "EUR",
  to = "PHP",
): Promise<QuotesResponse> {
  const params = new URLSearchParams({ from, to, amount: String(amount) });
  if (method) params.set("method", method);
  const res = await fetch(`/api/quotes?${params}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`quotes request failed (${res.status})`);
  }
  return (await res.json()) as QuotesResponse;
}
