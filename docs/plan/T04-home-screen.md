# T04 — Home screen (web)

## Dependencies
- **Reads:** [home](../modules/home.md) (acceptance criteria — binding), [platforms/web](../platforms/web.md) (desktop layout rules), `web/app/(tabs)/compare/page.tsx` (style reference)
- **Task deps:** T03 (`/api/history` for the 24h delta)

## Used by
- [MODULES.md](../MODULES.md) Home/Web status; root route lands here

## Goal
Port Home to `web/app/(tabs)/home/page.tsx` per the module spec: hero rate card, top-3 providers, "Compare all" CTA.

## Pre-made decisions
- Default amount: **€500** (fixed; persistence of last amount is ⏳ future).
- 24h delta: last two points of `getHistory("7D")`, labeled **"vs yesterday"** (see T03 — never present it as intraday).
- Sponsored slot: **render nothing** (no inventory yet). Leave a `{/* sponsored slot — 0–1 offers, see docs/modules/home.md */}` placeholder comment.
- Top-3 = first 3 quotes by `receiveAmount` desc from `getQuotes(500)`; card click → `/provider/<providerID>` (route exists after T05 — use the link now regardless).

## Steps
1. Create `web/app/(tabs)/home/page.tsx` (client component, mirror compare page patterns): fetch quotes + history in parallel on mount.
2. Hero card: mid-market rate (4 decimals), delta arrow (`--success` green up / `--error` red down), relative "updated Xm ago" timestamp.
3. Top-3 provider cards: icon, name, effective rate, receive amount for €500, source tag when `source === "wise-comparisons"` ("via Wise") — same tag component/copy as Compare.
4. "Compare all" button → `/compare`.
5. States per spec: skeleton placeholders (not spinners) while loading; clear fallback when the pair has no quotes.
6. Enable the Home tab in `web/app/(tabs)/layout.tsx` (`href: "/home"`); update `web/app/page.tsx` to redirect to `/home` instead of its current target.
7. Update [MODULES.md](../MODULES.md): Home/Web stays ◐ (real quotes, no persistence) — adjust the row's spec link text only if wrong. Check off T04 in the plan README.

## Verify
`npm run dev` → `/` lands on Home; rate, delta, top-3 and skeletons render; provider card navigates (404 until T05 is fine — note it in the final report). Resize: desktop uses width (no phone column). `npm run build && npm run lint`.

## Out of scope
Sponsored inventory, pull-to-refresh, persistence, Premium CTA.
