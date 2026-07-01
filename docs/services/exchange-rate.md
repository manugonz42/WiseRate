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

1. **Mid-market rate**: derived from the Wise Comparisons response (the quote flagged `isConsideredMidMarketRate`). No separate FX call needed for now — `exchangerate.host` moved behind an access key, and Open Exchange Rates is reserved as a future fallback.
2. **Provider quotes**: per-provider, either:
   - **Wise Comparisons API** — the current no-scraping source, OR
   - direct fetch of each provider's rate page (server-side scrape + affiliate API where available — for providers the comparisons endpoint doesn't cover).

Server-side proxy (`/api/quotes`) runs the scrapes; clients only see the unified `Quote[]`.

### Implemented: Wise Comparisons API (no scraping)

Web `/api/quotes` (`web/app/api/quotes/route.ts` → `web/lib/services/wise.ts`) is live against:

```
GET https://api.wise.com/v4/comparisons/?sourceCurrency=EUR&targetCurrency=PHP&sendAmount=1000
```

- **No API key, public, official** — one call returns quotes for Wise *and* the other regulated providers (~12 for EUR→PHP), plus a mid-market reference. This is the "no-scraping" set from `proveedores.md`.
- Mapping notes: Wise `markup` is a percentage → stored as `markup/100` to satisfy the data-model `0..1` contract; `receivedAmount` already nets the fee; `deliveryEstimation.duration` (seconds) is usually `null` → label `"Not specified"`; `deliveryMethod` is not exposed by this endpoint → defaults to `bankTransfer` (**delivery-method filter chips deferred** until we have a source that provides it).
- `trustScore` for the "most trusted" sort is editorial, keyed by provider alias against the `proveedores.md` "100% fiables" list (`TRUST` map in `wise.ts`).
- Caching: server `fetch` uses `next: { revalidate: 120 }` (quotes TTL 2 min, per the table below).

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
