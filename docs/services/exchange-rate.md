# Service: Exchange Rate

Replaces the mocked `ExchangeRateService` + `TransferProviderService` in `SendRate/Core/Services/Services.swift`.

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

1. **Mid-market rate** — *implemented.* Single source of truth: **Frankfurter** (ECB daily reference rates, no API key, no rate limit). A single timeseries call covers the latest close plus prior closes used to derive `delta24h` / `delta7d`. Cached 5 min in memory, 1 h on disk (`RateCache`). Spot + `getHistorical` are live in `SendRate/Core/Services/Services.swift`. Caveat: ECB publishes once per business day, so intraday 24H is approximated from recent daily closes.
2. **Provider quotes** — *still mock, deferred* (see below). Anchored to the real mid-market rate. Per-provider, eventually either:
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

Spot + historical memory TTLs above are implemented (`RateCache`, 5 min spot / 24H, 1 h for ≥7D). Quote TTLs are aspirational until the aggregator lands.

## Fallback

On network failure: serve the most recent cached value with a `stale: true` flag. UI shows a "last updated X ago" hint when stale.

## Open questions

- Provider partnership / affiliate IDs — needed before launching scrapes legally.
- Rate limit headroom for free tier on mid-market source.
- Do we surface mid-market vs receive-amount markup explicitly to users? (Spec says yes — see `markupPercentage` in [data-model](../architecture/data-model.md).)

## Deferred: comparison engine (define later)

Decided to postpone the real comparison/quote-acquisition engineering. Parked decisions:

- **Final-price comparison is the core metric.** Rank by `receiveAmount` (dinero que llega a la cuenta destino) for a fixed total outlay, not by rate or fee in isolation. See deferred note in [data-model](../architecture/data-model.md) re: defining `sendAmount` as total outlay (fee included).
- **Public vs server.** Mid-market rate can be public; per-provider final quotes cannot (CORS, key exposure, rate limits, anti-scraping). Need a backend aggregator: cron (~1h, faster on volatile pairs) pulls per-provider *pricing components* (rate + fee tiers), snapshots to a DB, and `/api/quotes` computes `receiveAmount` for any amount on the fly.
- **Snapshots double as history.** The same hourly snapshots are the only viable source for [analytics](../modules/analytics.md) (`getHistorical`) and [alerts](../modules/alerts.md). On-demand public fetch can't produce history.
- **Quote source — pick later:** Wise Comparison API (multi-provider final amounts in one call) vs own scraping/affiliate per provider.
- A dedicated `docs/services/quote-aggregator.md` spec to be written when this is picked up.
