# Service: Exchange Rate

Replaces the mocked `ExchangeRateService` + `TransferProviderService` in `WiseRate/Core/Services/Services.swift`.

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md) (`TransferQuote`, `HistoricalRate`)

## Used by
- [home](../modules/home.md), [comparison](../modules/comparison.md), [provider-details](../modules/provider-details.md), [analytics](../modules/analytics.md), [alerts](../modules/alerts.md)

## Contract

```
getRate(from, to) -> Rate { rate, timestamp, delta24h, delta7d }
getQuotes(from, to, amount, method?) -> Quote[]         // Quote ≈ TransferQuote
getHistorical(from, to, range: 24H|7D|30D|3M|6M|1Y) -> HistoricalRate[]
```

`method` (a single `DeliveryMethod`) filters by delivery method; omit it for the best quote per provider. Web: `/api/quotes?...&method=bankTransfer|cashPickup|mobileWallet`; only these three are accepted (unknown → no filter). See **Delivery-method support** below.

Async; errors classified `network | rateLimit | unsupportedPair | serverError`. Server-side proxy (`/api/quotes`) does the fetching; clients only see the unified `Quote[]`. Mid-market rate comes from the Wise Comparisons response (`isConsideredMidMarketRate` quote) — no separate FX call (`exchangerate.host` went key-only; Open Exchange Rates is the reserved fallback).

## Implemented sources (web, all public, no keys)

`/api/quotes` (`web/app/api/quotes/route.ts` → `web/lib/services/quotes.ts`) aggregates in parallel (`Promise.allSettled`), cached 120 s keyed `quotes:v1:${from}:${to}:${amount}`:

| Tier | Endpoint | Providers | Notes |
|---|---|---|---|
| direct | `POST api.wise.com/v3/quotes/` | Wise | canonical BANK_TRANSFER→BANK_TRANSFER |
| direct | `POST westernunion.com/wuconnect/prices/catalog` | Western Union | canonical service 500 Direct-to-Bank × fund-in EB |
| direct | `GET api.remitly.io/v3/calculator/estimate` | Remitly | returns base rate **and** new-customer promo |
| direct | `GET my.transfergo.com/api/booking/quotes` | TransferGo | per-method options incl. PH wallets |
| direct | `POST api.currencyfair.com/comparisonQuotes` | CurrencyFair | bank-to-bank only; T22 tier-A classification |
| direct | `GET api.taptapsend.com/api/fxRates` (headers required*) | Taptap Send | rate per corridor (not per amount); flat-fee schedule bundled in response; fee 0 toward PH; EUR/GBP/USD/CAD/AUD→PHP |
| direct | `GET app.sendwave.com/v2/pricing-public` | Sendwave | per (corridor, amount); returns standard + promo rates separately; flat fee on top; EUR/GBP/USD/CAD→PHP (no AUD); per-corridor send cap → 400 `pricing-limit-violation` treated as "no quote" (CAD tops out between 940 y 950 CAD; verified 2026-07-22) |
| filler | `GET api.wise.com/v4/comparisons/` | everyone else (~8 for EUR→PHP) | numbers Wise attributes to competitors; flagged in UI |
| excluded | — | ABN AMRO, BNP Paribas, UniCredit, Wells Fargo, HSBC Australia | dropped entirely (see T22 bank audit below), not shown via any source |

Aggregation rules (`quotes.ts`):

- **Normalization:** `receiveAmount` = what the recipient gets when the sender pays exactly `sendAmount` **in total**; fee-on-top providers (WU, Remitly) convert as `(amount − fee) × rate`. CurrencyFair's own endpoint already returns `receiveAmount` net of its fee; the send-currency `fee` field is derived (`amount − receiveAmount/rate`) for display only.
- **Promos:** base fields = standard no-promo price when derivable; first-transfer offer in `promo` (`PromoInfo`, `kind: "first-transfer"`). TransferGo publishes no no-promo FX price → base = promo price, `baseIsStandard: false`. **Ranking always uses base fields.** A separate `kind: "referral"` exists for our own affiliate-link bonuses (editorial, `providers.ts` `referralPromo`, not derived from any API) — unpopulated until a real affiliate deal exists.
- **Precedence:** a `direct` quote replaces the comparisons row for the same `providerID` (comparisons logo kept); surviving comparisons rows carry `source: "wise-comparisons"` for the UI tag; a failed direct source silently falls back to its comparisons row.
- **Exclusion:** `EXCLUDED_PROVIDER_IDS` (`quotes.ts`) drops comparisons rows for banks with no referral/affiliate program (T22 audit, 2026-07-06) before they ever reach `byProvider` — never shown, not even tagged "via Wise".
- **Mid-market ref:** comparisons response; fallback Wise direct `rate` (Wise quotes at mid-market).

### Delivery-method support (per source)

The `method` filter is threaded from `/api/quotes` → `getAggregatedQuotes(from, to, amount, method?)` → each source. **Only Western Union and TransferGo re-price per method today.** Every other source has no per-method public endpoint yet, so it ignores the filter and returns its default bank-transfer quote — *same amount for now*, until we obtain each provider's per-method API. When a specific method is selected, a row whose `deliveryMethod` differs is tagged "via {method}" in the UI so the unchanged number is explained.

| Source | Methods it can return | How the filter is applied | If method unsupported |
|---|---|---|---|
| **Western Union** | `bankTransfer` (service 500 Direct to Bank), `cashPickup` (000 Money In Minutes), `mobileWallet` (800 Mobile Money) | `SERVICE_BY_METHOD` picks the matching service group from the one catalog POST (EB fund-in) | returns `null` → falls back to comparisons row |
| **TransferGo** | whatever payouts the booking API lists for a bank pay-in — `bankTransfer` / `mobileWallet` (PH wallet) / `cashPickup` / `debitCard` (varies live; the captured fixture only had PH wallet) | keep payouts whose `PAYOUT_METHOD` matches, then best receive amount; no filter ⇒ best across all payouts (legacy) | returns `null` → falls back to comparisons row |
| **Wise (direct)** | `bankTransfer` only (BANK_TRANSFER→BANK_TRANSFER) | filter ignored | returns its bank quote unchanged |
| **Remitly** | endpoint returns one estimate, no method param | filter ignored | returns its bank quote unchanged |
| **CurrencyFair** | `bankTransfer` only (bank-to-bank) | filter ignored | returns its bank quote unchanged |
| **Taptap Send** | `bankTransfer` (default); supports `mobileWallet` (GCash/Maya) but no per-method endpoint yet | filter ignored | returns its bank quote unchanged |
| **Sendwave** | `bankTransfer` (default); supports `mobileWallet` (GCash) and `cashPickup` but no per-method endpoint yet | filter ignored | returns its bank quote unchanged |
| **Wise Comparisons** | method not exposed; all rows default `bankTransfer` | filter ignored | rows returned unchanged |

Cache key includes the method (`quotes:v1:${from}:${to}:${amount}:${method ?? "all"}`). `/api/health` still probes the corridor without a method (default bank-transfer path). Follow-up: wire real per-method endpoints for Remitly/others as their partner APIs land (see [SolicitarAfiliados.md](../../SolicitarAfiliados.md)).

### T22 classification record (2026-07-06)

Full tier-A/B/C research for `docs/plan/T22-quote-fidelity.md` step 1 — every candidate beyond the existing 4 direct sources:

| Provider | Tier | Why |
|---|---|---|
| **CurrencyFair** | **A** | `POST api.currencyfair.com/comparisonQuotes`, no auth — verified at 3 amounts, wired in |
| MoneyGram | B | API host (`apisvcs.moneygram.com`) found but Cloudflare Bot Management blocks non-browser requests (403 on every path) |
| WorldRemit | B | PerimeterX bot wall on every page; no pricing endpoint discoverable in shipped JS |
| Xoom | B | Guest calculator is Next.js SSR — no client-callable quote endpoint found in its bundles |
| Instarem | B | Public endpoint found (`wp-json/instarem/v2/convert-rate`) but it's a bare FX table (no fee, no amount param) — real quote route (`/api/v1/quote`) requires auth |
| Ria | B | Vue SPA calculator, config-fetched API base not found statically; direct path probes hit TLS resets; documented partner API requires a subscription key |
| Moneytrans | B | Exact calculator endpoint + params reverse-engineered from JS, but every call hits a Cloudflare managed JS challenge |
| Revolut | B/C | Entire `revolut.com` is behind a Cloudflare bot wall (403 on a bare GET); only documented quote API is OAuth-gated Business API |
| XE Money Transfer | C | `transfer.xe.com` redirects unauthenticated requests straight to login; no quote without an account |
| Paysend | C | No pricing/calculator endpoint found in any JS bundle; guessed paths 500 or redirect away |
| OFX | C | Consumer flow requires login; documented Payments API is OAuth-only |
| Small World / Sigue | C | Both companies **ceased operating in 2026** (Sigue ordered to stop, March 2026; Small World in special administration since 18 June 2026) — not a technical blocker, a corporate one |

**Bank referral/affiliate audit (2026-07-06)** — none of ABN AMRO, BNP Paribas, UniCredit, Wells Fargo, or HSBC Australia have a joinable referral/affiliate program relevant to international transfers (checked each bank's own site plus Awin/Pepperjam/Conversant/Rakuten network listings; where a "refer a friend"/affiliate program exists at all, e.g. UniCredit, HSBC Expat, it targets new account-opening, not FX/remittance traffic). All 5 are in `EXCLUDED_PROVIDER_IDS`.

Comparisons-endpoint mapping notes: its competitor numbers can diverge from operator prices (live check 2026-07-02: WU ~630 PHP worse on €1,000 — hence direct precedence). `isConsideredMidMarketRate` flags a **real sendable quote** — feeds the `rate` reference *and* stays listed. `markup` is a percentage → stored `/100` (data-model `0..1`). `deliveryEstimation.duration` (seconds) usually `null` → `"Not specified"`. Delivery method not exposed → defaults `bankTransfer` (the delivery-method filter is now live but only WU + TransferGo re-price — see **Delivery-method support** above). `trustScore` is editorial, keyed off [proveedores](../proveedores.md) "100% fiables" (`TRUST` map in `trust.ts`).

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

`GET /api/health` — per-source outcomes of the last EUR→PHP 1000 aggregation (`getSourceHealth()` in `quotes.ts`), for an external uptime monitor. Reads through the same 120 s cache as `/api/quotes` (cheap to poll); the snapshot is persisted in the shared KV cache alongside the quotes entry (same TTL) so any serverless instance can serve it. Response: JSON array of `{ source, ok, error?, at }` for `wise-comparisons | wise | western-union | remitly | transfergo | currencyfair | taptapsend | sendwave`; a fulfilled fetch with no quote = `ok: false, error: "no quote returned"`. `Cache-Control: no-store`. **200** when all ok, **503** when any failed.

\* Taptap Send `fxRates` requires `Appian-Version: web/2022-05-03.0`, `X-Device-Id: web`, `X-Device-Model: web` (same as the public widget, verified 2026-07-19); without them → 400 BAD_HEADER.

## Open questions

- Provider partnership / affiliate IDs — needed before launching scrapes legally.
- Surface mid-market vs receive-amount markup explicitly to users? (Spec says yes — `markupPercentage` in data-model.)
- `trustScore` methodology is editorial and undocumented — document criteria + label it editorial in the UI before public launch.
