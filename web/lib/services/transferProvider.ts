import type { SponsoredOffer, TransferQuote } from "@/lib/models";
import { generateQuotes, SPONSORED_OFFERS } from "@/lib/services/mockData";

export interface TransferProviderService {
  getQuotes(amount: number, baseRate?: number): Promise<TransferQuote[]>;
  getSponsoredOffers(): Promise<SponsoredOffer[]>;
}

export class MockTransferProviderService implements TransferProviderService {
  async getQuotes(amount: number, baseRate = 63.5): Promise<TransferQuote[]> {
    return generateQuotes(amount, baseRate);
  }

  async getSponsoredOffers(): Promise<SponsoredOffer[]> {
    return SPONSORED_OFFERS;
  }
}
