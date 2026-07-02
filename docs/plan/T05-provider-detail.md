# T05 — Provider Detail screen (web)

## Dependencies
- **Reads:** [provider-details](../modules/provider-details.md) (acceptance — binding), [data-model](../architecture/data-model.md) (`ProviderDetail`, `FeeStructure`), iOS mock content in `WiseRate/Core/Services/Services.swift` + `WiseRate/Core/Models/` (editorial pros/cons/limits to port)
- **Task deps:** T03 (history chart)

## Used by
- Compare row click, Home top-3 click; the affiliate CTA here is a revenue surface

## Goal
`web/app/provider/[id]/page.tsx`: provider deep-dive with trust, fees, pros/cons, historical chart, affiliate CTA.

## Pre-made decisions
- Chart lib: **Recharts** (`npm i recharts`) — decided for all web charts.
- Timeframe chips: 7D · 30D · 3M · 6M · 1Y (no 24H, see T03). **>30D render locked** with a lock icon + "Premium — coming soon" tooltip; clicking does nothing (no paywall exists yet).
- Editorial content: create `web/lib/data/providers.ts` — a `Record<providerID, ProviderEditorial>` (trust score, user rating, review count, min/max limits, fee rows, delivery methods, pros, cons, `websiteURL`, `affiliateURL: null`). Port values for **Wise, Western Union, Remitly, TransferGo** from the iOS mock; every other providerID gets a **generic fallback view** (live quote data + "detailed profile coming soon").
- Favorites: skip the toggle entirely (persistence lands in T06; spec marks it ⏳). Share: `navigator.share` with URL fallback to clipboard.
- CTA: "Send with <Provider>" → `affiliateURL ?? websiteURL`, `target="_blank" rel="sponsored noopener"`, plus disclosure line "We may earn a commission — you pay the same." Fire `console.info("analytics: provider.affiliate_outbound", { providerID })` (real wiring in T10).

## Steps
1. Add `ProviderDetail`/`FeeStructure` types to `web/lib/models/types.ts` mirroring data-model.md.
2. Build `web/lib/data/providers.ts` as above.
3. Build the page per the spec's acceptance list: header (icon, name, trust X.X/5, rating, review count), limits row, fee rows with delivery icon, delivery chips, pros/cons (two columns ≥`md`, stacked below), Recharts line chart + chips, prominent CTA (sticky-bottom below `md`).
4. Current live quote for this provider: fetch `getQuotes(500)` and pick by id — show its receive amount/fee next to the CTA.
5. Wire navigation: Compare row click and Home card click → `/provider/<id>` (Compare currently doesn't navigate — add it per [comparison](../modules/comparison.md) Outputs).
6. Update [MODULES.md](../MODULES.md) Provider Details/Web ◐→◐ (note: editorial data static). Check off T05.

## Verify
`npm run dev` → `/provider/wise` full profile; `/provider/<some comparisons-only id>` generic fallback; chart switches ranges; locked chips inert; CTA opens provider site in new tab. `npm test && npm run build && npm run lint`.

## Out of scope
Reviews sourcing (open question in spec), favorites, real analytics, affiliate URLs (human fills in later — keep `affiliateURL` nullable).
