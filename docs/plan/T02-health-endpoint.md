# T02 — Quote-source health endpoint

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md), `web/lib/services/quotes.ts`
- **Task deps:** T01 (parser refactor)

## Used by
- [ROADMAP](../ROADMAP.md) Phase 1 broken-parser alerting; human sets an UptimeRobot monitor on it

## Goal
A failed direct source currently falls back silently to its Wise-comparisons row. Expose `/api/health` so an external monitor alerts when any revenue-carrying source breaks.

## Steps
1. In `web/lib/services/quotes.ts`, record per-source outcomes during aggregation into a module-level export:
   ```ts
   export type SourceStatus = { source: string; ok: boolean; error?: string; at: string };
   export function getSourceHealth(): SourceStatus[]
   ```
   Sources: `wise-comparisons`, `wise`, `western-union`, `remitly`, `transfergo`. A fulfilled promise that returned `null` (no quote) counts as `ok: false, error: "no quote returned"`.
2. Create `web/app/api/health/route.ts` (GET): call `getAggregatedQuotes("EUR","PHP",1000)` (hits the 2-min cache, so monitor polling is cheap), then return `getSourceHealth()` as JSON. Status **200** when every source is ok, **503** when any failed. `Cache-Control: no-store`.
3. Update [exchange-rate](../services/exchange-rate.md): add a short `## Health` section documenting the endpoint and the 200/503 contract.

## Verify
- `npm run dev` → `curl -i localhost:3000/api/health` → 200 with all five sources `ok: true`.
- Temporarily break one provider URL locally → 503 listing that source → revert.
- `npm test && npm run build && npm run lint`.

## Out of scope
Email/Slack notifications (UptimeRobot handles alerting), retries, dashboards.
