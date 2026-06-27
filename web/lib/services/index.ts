// Single place that picks concrete service impls. Swap mock → real here.
import { MockExchangeRateService, type ExchangeRateService } from "@/lib/services/exchangeRate";
import type { TransferProviderService } from "@/lib/services/transferProvider";
import { LiveTransferProviderService } from "@/lib/services/liveTransferProvider";

export const exchangeRateService: ExchangeRateService = new MockExchangeRateService();
// Real quotes via the Wise Comparisons API through /api/quotes (15-min cache).
export const transferProviderService: TransferProviderService = new LiveTransferProviderService();

export type { ExchangeRateService } from "@/lib/services/exchangeRate";
export type { TransferProviderService } from "@/lib/services/transferProvider";
