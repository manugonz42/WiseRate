import type { SponsoredOffer, TransferQuote } from "@/lib/models";
import type { TransferProviderService } from "@/lib/services/transferProvider";
import { generateQuotes, SPONSORED_OFFERS } from "@/lib/services/mockData";

// Real quotes from the web server's /api/quotes route (Wise Comparisons API,
// cached/refreshed every 15 min). Sponsored offers stay mock for now.
export class LiveTransferProviderService implements TransferProviderService {
  async getQuotes(amount: number): Promise<TransferQuote[]> {
    // Server-side (SSR / route warmers): call the upstream directly — a relative
    // fetch has no origin there. Client-side: go through our same-origin route
    // (avoids the Wise API's CORS restrictions).
    if (typeof window === "undefined") {
      const { fetchWiseQuotes } = await import("@/lib/services/wiseComparison");
      try {
        return await fetchWiseQuotes(amount);
      } catch {
        return generateQuotes(amount);
      }
    }

    try {
      const res = await fetch(`/api/quotes?amount=${encodeURIComponent(amount)}`);
      if (!res.ok) return generateQuotes(amount);
      const data = (await res.json()) as { quotes: TransferQuote[] };
      return data.quotes;
    } catch {
      return generateQuotes(amount);
    }
  }

  async getSponsoredOffers(): Promise<SponsoredOffer[]> {
    return SPONSORED_OFFERS;
  }
}
