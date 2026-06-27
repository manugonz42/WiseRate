# Service: Exchange Rate

Replaces the mocked `ExchangeRateService` + `TransferProviderService` in `WiseRate/Core/Services/Services.swift`.

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md) (`TransferQuote`, `HistoricalRate`)
- **Future:** ⏳ backend proxy endpoint `/api/quotes` (server-side scrape/affiliate aggregation)

## Used by
- [home](../modules/home.md), [comparison](../modules/comparison.md), [provider-details](../modules/provider-details.md), [analytics](../modules/analytics.md), [alerts](../modules/alerts.md) (for "current rate" reference)

## What it does

Fetches the current mid-market rate, per-provider quotes, and historical rates for a currency pair.

## Contract

```
getRate(from, to) -> Rate
  Rate { rate, timestamp, delta24h, delta7d }

getQuotes(from, to, amount, methods?: DeliveryMethod[]) -> Quote[]
  Quote ≈ TransferQuote (see data-model.md)

getHistorical(from, to, range: 24H|7D|30D|3M|6M|1Y) -> HistoricalRate[]
```

All methods async. Errors classified: `network`, `rateLimit`, `unsupportedPair`, `serverError`.

## Provider selection

Two-tier approach:

1. **Mid-market rate**: a single source of truth — **Open Exchange Rates** (free tier 1000 req/mo) or **exchangerate.host** (free, less reliable). Cache 5 min in memory, 1 h on disk.
2. **Provider quotes**: per-provider, either:
   - **Wise Comparisons API** if approved (gives multi-provider quotes in one call), OR
   - direct fetch of each provider's rate page (server-side scrape + affiliate API where available — Remitly, Xoom, Western Union).

Server-side proxy (`/api/quotes`) runs the scrapes; clients only see the unified `Quote[]`.

## Caching

| Data | TTL (mem) | TTL (disk) | Stale-while-revalidate |
|---|---|---|---|
| spot rate | 5 min | 1 h | yes |
| quotes | 2 min | 15 min | yes |
| historical 24H | 5 min | 1 h | yes |
| historical ≥7D | 1 h | 12 h | yes |

## Fallback

On network failure: serve the most recent cached value with a `stale: true` flag. UI shows a "last updated X ago" hint when stale.

## Open questions

- Provider partnership / affiliate IDs — needed before launching scrapes legally.
- Rate limit headroom for free tier on mid-market source.
- Do we surface mid-market vs receive-amount markup explicitly to users? (Spec says yes — see `markupPercentage` in [data-model](../architecture/data-model.md).)
