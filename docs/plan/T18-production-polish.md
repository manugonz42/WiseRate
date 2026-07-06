# T18 — Production polish: no dead ends, no mock leaks

## Dependencies
- **Reads:** `web/app/(tabs)/layout.tsx`, `web/app/provider/[id]/ProviderDetailClient.tsx`, `web/lib/services/` (quote aggregator), [comparison](../modules/comparison.md), [provider-details](../modules/provider-details.md)
- **Task deps:** T17 (footer already final)

## Used by
- Every reviewer/partner clicking around the deployed site; T21 QA asserts these behaviors

## Goal
Remove everything that reads as "unfinished demo": the disabled Profile tab, missing 404/error pages, `mock`-tagged quotes in production, and the empty-shell generic provider profile.

## Pre-made decisions
- **Drop the disabled Profile tab** from `TABS` in `(tabs)/layout.tsx` (4 tabs remain). Update [navigation](../architecture/navigation.md)'s web note: Profile/Settings/Premium are app-phase modules, not web MVP. MODULES.md web column for Profile/Settings/Premium/Referral/Onboarding → `☐` with a "post-MVP (apps)" footnote — the table must stop implying web work is pending there.
- **`app/not-found.tsx` + `app/error.tsx`** (error is a client component): dark-theme, one heading, one sentence, links to `/home` and `/compare`. No illustration hunt — typographic only.
- **Mock quotes never ship in prod.** Inspect the aggregator: if any path can return `source: "mock"` quotes, filter them out in the `/api/quotes` route when `process.env.NODE_ENV === "production"`; an all-providers-down request returns an empty list and the existing empty/error state — never fabricated numbers. Keep mock in dev/test (fixtures depend on it). The `"mock"` UI tag stays for dev.
- **Generic provider fallback** (`genericProviderDetail`): hide zero-valued stats (trust 0, rating 0, 0 reviews) and empty sections (fees/pros/cons/limits) instead of rendering them; copy becomes "We don't have a full profile for {name} yet." + live quote (if any) + "Compare all providers →". Noindex fallback from T14 stays.
- **Alerts honesty line** on `/alerts`: "Alerts are saved in this browser and checked while a tab is open. Email delivery is coming soon." One sentence, muted. No new alert logic (ROADMAP Phase 3 rule: no further client-side alert investment).

## Steps
1. Tabs cleanup + navigation/MODULES docs sync (spec first, then code).
2. `not-found.tsx`, `error.tsx`.
3. Aggregator audit → prod mock filter in the API route + a vitest asserting prod behavior (mock env via `vi.stubEnv`).
4. Generic provider fallback rework; update [provider-details](../modules/provider-details.md) acceptance note.
5. Alerts copy line. Check off T18 in plan README.

## Verify
`/definitely-not-a-route` renders the 404. `/provider/doesnotexist` shows the honest fallback with no zero-stats. Grep rendered Compare/Home HTML for "mock" under a prod build (`npm run build && npm start`) — absent. `npm test && npm run build && npm run lint`.

## Out of scope
Real alert delivery (Phase 3), web Profile/Settings screens, redesigns of existing screens.
