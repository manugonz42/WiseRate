# T24 — Compare: drop the Best-deal banner, mark the best row inline

## Dependencies
- **Reads:** [comparison](../modules/comparison.md), `web/app/(tabs)/compare/page.tsx`
- **Task deps:** T23 (same file — land T23 first to avoid conflicts)

## Used by
- Compare screen; visual consistency with Home's winner treatment

## Goal
`A_mejorar.md` item 6. The amber "Best deal" banner above the results is redundant — the same provider is always right below it. Remove the banner; the best row itself carries the distinct background + a "BEST DEAL" label (Home-style winner treatment).

## Pre-made decisions (binding)
- Delete the banner JSX block (the `{best && !loading && !error && (...)}` section with the `Star` icon and "saves you ~₱X vs. the average" copy).
- Delete the `avgReceive` memo — the banner was its only consumer. Keep `methodMatched` and `best` (still drive `isBest`).
- The amber row treatment already exists (`isBest` styling in `QuoteTableRow` and `QuoteRow`) — keep it.
- Desktop table (`QuoteTableRow`): replace the bare `<Star .../>` icon in the provider cell with the same pill the mobile card uses: `Star` icon + text, label **"BEST DEAL"** (`bg-warning/20 text-warning` pill, matching the existing mobile `BEST` badge classes).
- Mobile card (`QuoteRow`): rename the badge text `BEST` → `BEST DEAL`.
- The savings-vs-average copy is dropped, not relocated (Home already communicates savings).

## Steps
1. Edit `web/app/(tabs)/compare/page.tsx` per the decisions. Remove now-unused imports (`Star` stays — the badge still uses it; verify with lint).
2. Update `docs/modules/comparison.md`: acceptance criterion "best deal is indicated inline on its row (background + BEST DEAL badge), no separate banner".

## Verify
- Playwright at 1280px and 390px widths: no banner element; exactly one row shows the BEST DEAL badge; that row has the amber background; sorting/filtering still moves the badge to the correct row (badge follows highest `receiveAmount` among method-matched quotes, not the top sorted row).
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No changes to how `best` is computed, no changes to Home, no new components/files.
