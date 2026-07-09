# T26 — Analytics: unlock 3M / 6M / 1Y ranges on web

## Dependencies
- **Reads:** [analytics module](../modules/analytics.md), [exchange-rate](../services/exchange-rate.md), `web/app/(tabs)/analytics/page.tsx`, `web/lib/services/history.ts`, `web/app/api/history/route.ts`
- **Task deps:** none

## Used by
- Analytics screen; answers `A_mejorar.md` item 11

## Why were they locked? (decision record)
The 3M/6M/1Y lock mirrored the iOS premium gate ("≥3M gated" was a T04–T07 port decision). Web has no Premium (app-phase module, ROADMAP Phase 5), the data source (Frankfurter/ECB) is free at any range, and `HistoryRange`/`rangeToDateWindow` already support all five ranges. **Decision 2026-07-09: web unlocks all ranges.** iOS keeps its own gating decision — that's per-platform, revisit there in Phase 2.

## Pre-made decisions (binding)
- Remove `LOCKED_RANGES` and every `locked` branch from `web/app/(tabs)/analytics/page.tsx` (button styling, `aria-disabled`, `title`, the guard in `handleRangeChange`, the `Lock` import).
- `/api/history` and `getHistory` stay untouched unless a range is rejected — they already type-accept all five ranges.
- Tests: `web/lib/services/__tests__/history.test.ts` must cover `rangeToDateWindow` for 3M, 6M, 1Y (add the missing cases if not present; follow the existing test style).

## Steps
1. Edit the analytics page per decisions.
2. Check/extend the history tests.
3. Update `docs/modules/analytics.md`: web acceptance criteria now include all five ranges; record the decision above (dated 2026-07-09). MODULES.md needs no status change (Analytics web already ✅).

## Verify
- Dev server + Playwright: click each of 7D/30D/3M/6M/1Y — chart and the four stat cards render real data for each (Frankfurter must return non-empty series; if a range comes back empty, that's a bug to report, not to paper over).
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No 5Y/custom ranges (Frankfurter starts 1999 but the spec'd union stays as-is), no premium/paywall UI, no iOS changes.
