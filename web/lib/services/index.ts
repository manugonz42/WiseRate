// Single place that picks concrete service impls. Swap mock → real here.
import { MockExchangeRateService, type ExchangeRateService } from "@/lib/services/exchangeRate";
import { MockTransferProviderService, type TransferProviderService } from "@/lib/services/transferProvider";

export const exchangeRateService: ExchangeRateService = new MockExchangeRateService();
export const transferProviderService: TransferProviderService = new MockTransferProviderService();

export type { ExchangeRateService } from "@/lib/services/exchangeRate";
export type { TransferProviderService } from "@/lib/services/transferProvider";
