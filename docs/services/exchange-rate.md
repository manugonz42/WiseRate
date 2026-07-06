# Service: Exchange Rate

Replaces the mocked `ExchangeRateService` + `TransferProviderService` in `WiseRate/Core/Services/Services.swift`.

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md) (`TransferQuote`, `HistoricalRate`)

## Used by
- [home](../modules/home.md), [comparison](../modules/comparison.md), [provider-details](../modules/provider-details.md), [analytics](../modules/analytics.md), [alerts](../modules/alerts.md)

## Contract

```
getRate(from, to) -> Rate { rate, timestamp, delta24h, delta7d }
getQuotes(from, to, amount, methods?) -> Quote[]        // Quote ≈ TransferQuote
getHistorical(from, to, range: 24H|7D|30D|3M|6M|1Y) -> HistoricalRate[]
```

Async; errors classified `network | rateLimit | unsupportedPair | serverError`. Server-side proxy (`/api/quotes`) does the fetching; clients only see the unified `Quote[]`. Mid-market rate comes from the Wise Comparisons response (`isConsideredMidMarketRate` quote) — no separate FX call (`exchangerate.host` went key-only; Open Exchange Rates is the reserved fallback).

## Implemented sources (web, all public, no keys)

`/api/quotes` (`web/app/api/quotes/route.ts` → `web/lib/services/quotes.ts`) aggregates in parallel (`Promise.allSettled`), cached 120 s keyed `quotes:v1:${from}:${to}:${amount}`:

| Tier | Endpoint | Providers | Notes |
|---|---|---|---|
| direct | `POST api.wise.com/v3/quotes/` | Wise | canonical BANK_TRANSFER→BANK_TRANSFER |
| direct | `POST westernunion.com/wuconnect/prices/catalog` | Western Union | canonical service 500 Direct-to-Bank × fund-in EB |
| direct | `GET api.remitly.io/v3/calculator/estimate` | Remitly | returns base rate **and** new-customer promo |
| direct | `GET my.transfergo.com/api/booking/quotes` | TransferGo | per-method options incl. PH wallets |
| filler | `GET api.wise.com/v4/comparisons/` | everyone else (~9 for EUR→PHP) | numbers Wise attributes to competitors; flagged in UI |

Aggregation rules (`quotes.ts`):

- **Normalization:** `receiveAmount` = what the recipient gets when the sender pays exactly `sendAmount` **in total**; fee-on-top providers (WU, Remitly) convert as `(amount − fee) × rate`.
- **Promos:** base fields = standard no-promo price when derivable; first-transfer offer in `promo` (`PromoInfo`). TransferGo publishes no no-promo FX price → base = promo price, `baseIsStandard: false`. **Ranking always uses base fields.**
- **Precedence:** a `direct` quote replaces the comparisons row for the same `providerID` (comparisons logo kept); surviving comparisons rows carry `source: "wise-comparisons"` for the UI tag; a failed direct source silently falls back to its comparisons row.
- **Mid-market ref:** comparisons response; fallback Wise direct `rate` (Wise quotes at mid-market).

Comparisons-endpoint mapping notes: its competitor numbers can diverge from operator prices (live check 2026-07-02: WU ~630 PHP worse on €1,000 — hence direct precedence). `isConsideredMidMarketRate` flags a **real sendable quote** — feeds the `rate` reference *and* stays listed. `markup` is a percentage → stored `/100` (data-model `0..1`). `deliveryEstimation.duration` (seconds) usually `null` → `"Not specified"`. Delivery method not exposed → defaults `bankTransfer`, **delivery-method filter chips deferred**. `trustScore` is editorial, keyed off [proveedores](../proveedores.md) "100% fiables" (`TRUST` map in `trust.ts`).

## Known source limitations

- **No intraday source.** Frankfurter/ECB = one rate per business day (~16:00 CET) — `24H` range and true `delta24h` cannot be served. UI omits 24H; never present daily data as intraday.
- **Cache:** `web/lib/services/cache.ts` — Upstash Redis (REST, `ex: 120`) when `UPSTASH_REDIS_REST_URL`/`_TOKEN` set (shared, survives cold starts — required in prod); else in-memory Map (local dev). Upstash errors log + count as cache miss, never fail the request.

## Caching TTLs

| Data | TTL (mem) | TTL (disk) | Stale-while-revalidate |
|---|---|---|---|
| spot rate | 5 min | 1 h | yes |
| quotes | 2 min | 15 min | yes |
| historical 24H | 5 min | 1 h | yes |
| historical ≥7D | 1 h | 12 h | yes |

Fallback on network failure: serve the last cached value with `stale: true`; UI shows "last updated X ago".

## Health

`GET /api/health` — per-source outcomes of the last EUR→PHP 1000 aggregation (`getSourceHealth()` in `quotes.ts`), for an external uptime monitor. Reads through the same 120 s cache as `/api/quotes` (cheap to poll); the snapshot is persisted in the shared KV cache alongside the quotes entry (same TTL) so any serverless instance can serve it. Response: JSON array of `{ source, ok, error?, at }` for `wise-comparisons | wise | western-union | remitly | transfergo`; a fulfilled fetch with no quote = `ok: false, error: "no quote returned"`. `Cache-Control: no-store`. **200** when all ok, **503** when any failed.

## Open questions

- Provider partnership / affiliate IDs — needed before launching scrapes legally.
- Surface mid-market vs receive-amount markup explicitly to users? (Spec says yes — `markupPercentage` in data-model.)
- `trustScore` methodology is editorial and undocumented — document criteria + label it editorial in the UI before public launch.
