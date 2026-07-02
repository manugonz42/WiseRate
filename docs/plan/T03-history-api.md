# T03 — Historical rates API

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md) (contract, caching TTLs, **known source limitations**), [data-model](../architecture/data-model.md) (`HistoricalRate`)
- **Task deps:** none

## Used by
- T04 (24h delta), T05 (provider chart), T07 (analytics charts)

## Goal
Server endpoint serving daily historical mid-market rates from Frankfurter (ECB), plus a typed client wrapper.

## Pre-made decisions
- **No 24H range.** Frankfurter is one rate per business day — 24H intraday cannot be served (spec: exchange-rate.md → Known source limitations). The API accepts `7D|30D|3M|6M|1Y` only; UI tasks omit the 24H chip.
- "24h delta" on Home = change vs the previous **daily** ECB fix, labeled "vs yesterday".

## Steps
1. Add to `web/lib/models/types.ts`: `export interface HistoricalRate { date: string; rate: number; }` — deliberate subset of data-model.md's entity: `id`/`provider` omitted (an ECB series needs neither); say so in a comment. This is not a spec conflict.
2. Create `web/app/api/history/route.ts` (GET, params `from`, `to`, `range`):
   - Map range → start date (7D/30D/3M/6M/1Y back from today); end = today.
   - Fetch `https://api.frankfurter.dev/v1/{start}..{end}?base={from}&symbols={to}` with `next: { revalidate: 3600 }` (spec TTL: ≥7D = 1 h).
   - Normalize to `{ from, to, range, rates: HistoricalRate[] }` sorted by date asc.
   - 400 for unknown range (message: "24H not supported — daily ECB data only"); 502 if Frankfurter fails and nothing cached.
3. Create `web/lib/services/history.ts` client wrapper mirroring `rate.ts` style: `getHistory(range, from = "EUR", to = "PHP")`.
4. Vitest for the range→date mapping (extract it as a pure exported function).

## Verify
`npm run dev` → `curl "localhost:3000/api/history?from=EUR&to=PHP&range=30D"` returns ~22 daily points, dates ascending. `range=24H` → 400. `npm test && npm run build && npm run lint`.

## Out of scope
Intraday sources, charts (T05/T07), Open Exchange Rates fallback.
