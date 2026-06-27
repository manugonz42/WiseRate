# Service: Quotes Server

The backend that collects each provider's real numbers and exposes a single, comparable
`Quote[]` for the EUR→PHP corridor. The comparison key is **money debited from the sender's bank
→ money received by the recipient**, accounting for every cost. Implements the `/api/quotes`
proxy anticipated by [exchange-rate](exchange-rate.md).

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md) (`TransferQuote`, `Rate`, `HistoricalRate`, `DeliveryMethod`), [providers-eur-php](../reference/providers-eur-php.md) (legal provider universe + `quoteSource`), [provider-adapters](provider-adapters.md) (per-provider extraction)
- **Future:** ⏳ Postgres + Redis datastore; ⏳ Vercel-independent host (Railway/Fly/Render); ⏳ Playwright scraping worker (fallback only)

## Used by
- [exchange-rate](exchange-rate.md) — real impl that supersedes the Frankfurter-only client
- [comparison](../modules/comparison.md), [home](../modules/home.md), [provider-details](../modules/provider-details.md), [analytics](../modules/analytics.md) — all consume its `Quote[]` / `Rate` / `HistoricalRate`
- Web `web/lib/services/index.ts` (swap point), iOS/Android `*Service` real impls

## Topology (separate backend)

A standalone Node/TypeScript service (Fastify), deployed on its own host with its own datastore —
independent of the Vercel web deploy.

```
Providers ──(adapters: official/affiliate API → scrape fallback)──▶ Collector (cron worker)
                                                                          │ writes
                                                                          ▼
                                                  Postgres (snapshots + history) + Redis (hot cache)
                                                                          │ reads
   iOS / Android / Web  ──HTTP(JSON)──▶  Read API (Fastify)  ◀───────────┘
```

- **Collector (scheduled worker):** loops over (corridor × method × amount-bucket), calls each
  [adapter](provider-adapters.md), normalizes to a `Quote`, writes a snapshot. Isolated process —
  a slow/failing provider never blocks reads.
- **Read API (Fastify):** thin, stateless; serves snapshots + does on-demand exact-amount
  refresh. Single contract for all three apps.
- **Datastore:** Postgres for durable snapshots + rate history (feeds Analytics charts); Redis as
  hot cache mirroring the TTLs in [exchange-rate](exchange-rate.md).

### Where each collector runs (split)

Not every provider needs the heavy backend. Collection is split by cost of acquisition:

- **API-only providers → hosted by the web's own Next.js server.** Sources reachable in one or a
  few HTTP calls (the **public Wise Comparisons API**, plus partner APIs) are fetched and cached
  **by the web app itself** via a Next.js route (`web/app/api/quotes/route.ts`), refreshed every
  **15 min** (fetch-level `revalidate: 900` + a Vercel Cron warm). No separate service required.
- **Scrape-only providers → the separate backend.** Only providers that need a headless browser
  (cash-pickup / GCash legs of WorldRemit, Xoom; Revolut) run in the standalone scraping
  worker/datastore described above. The web route merges both sources behind one `Quote[]`.

The **Wise Comparisons API is public (no credentials)** and already returns real EUR→PHP quotes
for Wise + ~12 tracked competitors (bank-transfer pay-in/pay-out only) — see
[providers-eur-php](../reference/providers-eur-php.md). It is the web route's primary source.

## True-cost quote model

Adapters return the provider's **actual quoted figures for the exact amount + method**, never a
mid-market derivation. The normalized `Quote` extends `TransferQuote` ([data-model](../architecture/data-model.md))
with the cost breakdown so "bank-out → recipient-in" is fully captured:

```
sendAmount      EUR debited from sender (what leaves the bank)
fundingFee      card/bank-debit surcharge (varies by funding method)
providerFee     fixed + percentage fee
fxRate          provider's REAL rate (already includes their FX markup)
payoutFee       cash-pickup / wallet payout cost, if any
receiveAmount   PHP the recipient actually gets  ← provider's own quote, source of truth
fetchedAt       timestamp
rateValidUntil  provider quote expiry, if given

// comparison keys (derived, vs mid-market from Frankfurter)
totalCostEUR   = sendAmount − (receiveAmount / midMarketRate)   // fee + FX markup in one number
effectiveRate  = receiveAmount / sendAmount
```

**Worked example** (mid-market 63.50, send €500, bank transfer):
provider quotes `receiveAmount = 31 200 PHP`, headline `providerFee = €0`.
`totalCostEUR = 500 − (31 200 / 63.50) = 500 − 491.34 = €8.66`. The "free" provider actually
costs €8.66 via FX markup — `totalCostEUR` exposes it; the headline fee would have hidden it.

Ranking (per [comparison](../modules/comparison.md)): best `receiveAmount` / lowest `totalCostEUR`
/ fastest. The list shows `totalCostEUR` so the user sees the all-in cost.

## Freshness & cadence

- **What changes when:** mid-market (ECB/Frankfurter) refreshes ~once/business-day; providers'
  intraday FX moves continuously (minutes); fee *structures* change rarely (days/weeks).
- **Collector cadence:** quotes every **~2–5 min** for popular amount buckets; mid-market every
  **5–60 min**. Mirrors the TTL table in [exchange-rate](exchange-rate.md).
- **Comparing:** reads are sub-second from cache — compare anytime.
- **Drift control (hybrid):** list uses the snapshot; when the user fixes the amount or before the
  outbound affiliate click, the API does an **on-demand exact-amount refresh** and returns
  `fetchedAt` (UI: "actualizado hace X"). The provider's own page, deep-linked with the amount
  prefilled, is the final source of truth — keeping displayed-vs-delivered gap minimal.

## App ↔ server contract

REST/JSON, consumed identically by iOS, Android, Web:

```
GET /v1/rate?from=EUR&to=PHP                                   -> Rate
GET /v1/quotes?from=EUR&to=PHP&amount=500&methods=bankTransfer -> { quotes: Quote[], fetchedAt, savingsHint? }
GET /v1/quotes/refresh?...   (on-demand exact-amount, hybrid)  -> { quotes, fetchedAt }
GET /v1/historical?from=EUR&to=PHP&range=24H|7D|30D|3M|6M|1Y   -> HistoricalRate[]
```

- **Web:** swap mock → HTTP client at `web/lib/services/index.ts`; `exchangeRate.ts` /
  `transferProvider.ts` get real impls calling the API.
- **iOS/Android:** point `ExchangeRateService` / `TransferProviderService` real impls at the same
  endpoints (replacing the per-platform mock + Frankfurter-only path).
- Errors classified as in [exchange-rate](exchange-rate.md): `network | rateLimit |
  unsupportedPair | serverError`. Stale responses flagged `stale: true`.

## Amount-dependent pricing + "send X more, save Y"

Pricing **is** amount-dependent (fixed + % fee, fee-free thresholds, occasional FX tiers), so
adapters always fetch for the exact amount; snapshots are bucketed by amount band.

**Savings hint:** after quoting the user's amount, the API probes a few candidate amounts (next
fee-tier / fee-free boundary, round numbers just above) via the same quote function. If a higher
send yields a higher `effectiveRate` or crosses a fee-free threshold, it returns
`savingsHint { extraSend, extraReceive }` → UI shows *"enviando €X más, el destinatario recibe €Y
más"*. Optional field on the quotes response; surfaced in [comparison](../modules/comparison.md).

## Open questions

- Host choice (Railway / Fly / Render) and Postgres+Redis provider.
- Wise Comparisons API approval — seeds many providers in one call if granted.
- Snapshot amount-bucket granularity vs storage cost.
