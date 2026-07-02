# T01 — Provider parser fixture tests

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md) (aggregation + normalization rules), `web/lib/services/providers/*.ts`, `web/lib/services/wise.ts`, `web/lib/models/types.ts`
- **Task deps:** none

## Used by
- [ROADMAP](../ROADMAP.md) Phase 1 — "the revenue flow must not fail silently"; T02 builds on the refactor

## Goal
Each provider response parser becomes a pure, tested function with a committed real-response fixture, so a provider changing its JSON breaks tests instead of silently dropping quotes.

## Steps
1. `cd web && npm i -D vitest` · add `"test": "vitest run"` to `package.json` scripts.
2. Create `web/vitest.config.ts`: node environment; alias `@` → project root (mirror `tsconfig.json` paths).
3. Refactor each of `providers/wiseDirect.ts`, `providers/westernUnion.ts`, `providers/remitly.ts`, `providers/transfergo.ts`, and `wise.ts` (comparisons) into three exported pieces, **without changing behavior**:
   - `buildRequest(from, to, amount): { url: string; init?: RequestInit }` — the exact request currently made inline
   - `parseX(json: unknown, from, to, amount): <current return type>` — pure, no fetch
   - the existing `fetchX(...)` — now `buildRequest` → `fetch` → `parseX`
4. Create `web/scripts/capture-fixtures.mjs`: for each provider, call `buildRequest("EUR","PHP",1000)`, fetch, write the **raw JSON** to `web/lib/services/providers/__fixtures__/<provider>.eur-php-1000.json` (pretty-printed). Run it once and commit the fixtures. (It imports TS — run via `npx tsx scripts/capture-fixtures.mjs`; `tsx` as devDependency if needed.)
5. Write `web/lib/services/providers/__tests__/<provider>.test.ts` per provider. Each test parses its fixture and asserts:
   - `providerID` / `providerName` are the expected constants; `exchangeRate > 0`; no `NaN`/`undefined` in numeric fields
   - **Normalization:** for fee-on-top providers (WU, Remitly): `receiveAmount ≈ (sendAmount − fee) × exchangeRate` (tolerance 0.01)
   - **Promos:** Remitly fixture → base fields are the standard price, promo lives in `promo`; TransferGo → `promo.baseIsStandard === false`
   - Wise comparisons parser → returns multiple quotes + a mid-market `rate`; markup stored as `0..1` (percentage ÷ 100)
6. Add a defensive test: `parseX(<empty object>)` returns `null` / throws a typed error — never a quote with `NaN`.

## Verify
`cd web && npm test && npm run build && npm run lint` — all green. `npm run dev` → `http://localhost:3000/compare` still shows direct quotes (source tag ≠ "via Wise" for Wise/WU/Remitly/TransferGo).

## Out of scope
Aggregator (`quotes.ts`) tests, alerting (T02), new providers, changing normalization rules.
