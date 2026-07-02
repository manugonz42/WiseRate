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

### Implemented: no-scraping sources (web)

Web `/api/quotes` (`web/app/api/quotes/route.ts` → `web/lib/services/quotes.ts`) aggregates, in parallel (`Promise.allSettled`, 120 s in-memory TTL keyed by pair+amount):

| Tier | Endpoint | Providers | Notes |
|---|---|---|---|
| direct | `POST api.wise.com/v3/quotes/` | Wise | public, no key; per-pay-in options — canonical BANK_TRANSFER→BANK_TRANSFER |
| direct | `POST westernunion.com/wuconnect/prices/catalog` | Western Union | public; full catalog per service × fund-in — canonical 500 Direct-to-Bank × EB |
| direct | `GET api.remitly.io/v3/calculator/estimate` | Remitly | public; returns base rate **and** new-customer promo |
| direct | `GET my.transfergo.com/api/booking/quotes` | TransferGo | public; per-method options incl. PH wallets |
| filler | `GET api.wise.com/v4/comparisons/` | everyone else (~9 for EUR→PHP) | numbers Wise attributes to competitors — see `providers.csv`; flagged in UI |

Aggregation rules (`web/lib/services/quotes.ts`):

- **Normalization:** `receiveAmount` = what the recipient gets when the sender pays exactly `sendAmount` **in total**. Fee-on-top providers (WU, Remitly) are converted as `(amount − fee) × rate`.
- **Promos:** base quote fields = standard no-promo price when derivable; the first-transfer offer lives in `promo` (`PromoInfo` in [data-model](../architecture/data-model.md)). TransferGo doesn't publish its no-promo FX price → its base = promo price, `baseIsStandard: false`. **Ranking always uses base fields.**
- **Precedence:** a `direct` quote replaces the comparisons row for the same `providerID` (the comparisons logo is kept). Every surviving comparisons row carries `source: "wise-comparisons"` so the UI can mark it as filler. A failed direct source silently falls back to its comparisons row.
- **Mid-market ref:** from the comparisons response; fallback: Wise direct `rate` (Wise quotes at mid-market).

About the comparisons endpoint:

- **No API key, public, official** — one call returns quotes for Wise *and* the other regulated providers (~12 for EUR→PHP), plus a mid-market reference. But live checks (2026-07-02) show its competitor numbers can diverge from the operator's own price (WU: ~630 PHP worse on €1,000) — hence direct sources take precedence.
- Mapping notes: `isConsideredMidMarketRate` flags a **real sendable quote** whose rate equals mid-market (typically Wise's own, with a real fee) — it feeds the `rate` reference *and* stays in the quote list. Wise `markup` is a percentage → stored as `markup/100` to satisfy the data-model `0..1` contract; `receivedAmount` already nets the fee; `deliveryEstimation.duration` (seconds) is usually `null` → label `"Not specified"`; `deliveryMethod` is not exposed by this endpoint → defaults to `bankTransfer` (**delivery-method filter chips deferred** until we have a source that provides it).
- `trustScore` for the "most trusted" sort is editorial, keyed by provider alias against the `proveedores.md` "100% fiables" list (`TRUST` map in `wise.ts`).
- Caching: server `fetch` uses `next: { revalidate: 120 }` (quotes TTL 2 min, per the table below).

## Known source limitations

- **No intraday source.** Frankfurter/ECB publishes one reference rate per business day (~16:00 CET) — the `24H` historical range and a true `delta24h` cannot be served from it. ⏳ intraday source needed (or drop `24H` from the UI). Until then, 24H views must not present daily data as live intraday movement.
- **Serverless cache reality.** The 120 s in-memory `Map` in `web/lib/services/quotes.ts` doesn't survive Vercel cold starts and isn't shared across instances — effective hit rate in prod is low. Move to Vercel KV / Upstash ([ROADMAP](../ROADMAP.md) Phase 3) before traffic grows.

## Caching

| Data | TTL (mem) | TTL (disk) | Stale-while-revalidate |
|---|---|---|---|
| spot rate | 5 min | 1 h | yes |
| quotes | 2 min | 15 min | yes |
| historical 24H | 5 min | 1 h | yes |
| historical ≥7D | 1 h | 12 h | yes |

## Fallback

On network failure: serve the most recent cached value with a `stale: true` flag. UI shows a "last updated X ago" hint when stale.

## Health

`GET /api/health` (`web/app/api/health/route.ts`) exposes per-source outcomes from the last EUR→PHP 1000 aggregation (`getSourceHealth()` in `web/lib/services/quotes.ts`), for an external uptime monitor to alert on a broken revenue-carrying source. Triggers `getAggregatedQuotes` first, so it reads through the same 120 s cache as `/api/quotes` — cheap to poll.

Response: JSON array of `{ source, ok, error?, at }` for `wise-comparisons`, `wise`, `western-union`, `remitly`, `transfergo`. A fulfilled fetch that returned no quote counts as `ok: false, error: "no quote returned"`. `Cache-Control: no-store`.

Status **200** when every source is `ok`, **503** when any failed.

## Open questions

- Provider partnership / affiliate IDs — needed before launching scrapes legally.
- Rate limit headroom for free tier on mid-market source.
- Do we surface mid-market vs receive-amount markup explicitly to users? (Spec says yes — see `markupPercentage` in [data-model](../architecture/data-model.md).)
- `trustScore` is editorial (keyed off the root `proveedores.md` "100% fiables" list) with no documented methodology — document the criteria and label it as editorial in the UI before public launch; `proveedores.md` should move under `docs/`.
