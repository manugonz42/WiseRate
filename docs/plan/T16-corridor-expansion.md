# T16 — Corridor expansion: verify + ship PHP-inbound corridors

## Dependencies
- **Reads:** [corridors](../modules/corridors.md) (enablement rule — binding), `web/lib/data/corridors.ts`, `web/lib/services/quotes.ts`
- **Task deps:** T13 (template + registry)

## Used by
- SEO reach beyond EUR→PHP; the corridor status table in the spec

## Goal
Verify which candidate corridors the aggregator actually serves, enable the passing ones in the registry with fresh editorial copy, and cross-link corridor pages.

## Pre-made decisions
- **Candidates (PHP-inbound only, OFW corridors):** GBP→PHP, USD→PHP, CAD→PHP, AUD→PHP. `defaultAmount` 1000 in the send currency.
- **Harness:** `web/scripts/verify-corridors.ts`, run via `npx tsx` (add `tsx` as devDependency if absent). For each candidate call `getAggregatedQuotes(from, to, 1000)` live and print provider count + names. **Pass = ≥3 distinct providers** (spec rule). Direct parsers may reject non-EUR corridors — that's expected; the Wise-comparisons filler tier decides. Record the run's results in the corridors spec status table (pass/fail + date).
- **Enable only passing corridors.** Each gets a registry entry with **fresh en copy** — intro and ≥4 FAQ entries specific to that corridor (payout options in PH are shared; sender-side framing differs: UK/US/CA/AU diaspora). No copy-paste intros with the currency swapped — vary structure and facts.
- **CTA rule from the spec:** only `eur-to-php` gets the `/compare` CTA; other corridors' snapshot table is the utility, plus provider links. Add a registry flag `hasCompareCTA` defaulting false, true for eur-to-php (refactor T13's page accordingly).
- **Cross-links:** "Sending from somewhere else?" strip on every corridor page listing the other enabled corridors (derived from the registry).
- Sitemap and static params already derive from the registry — no wiring, just confirm.
- Registry test from T13 must keep passing for every new entry.

## Steps
1. Harness script; run it; paste results into [corridors](../modules/corridors.md) status table.
2. Registry entries + copy for passing corridors; `hasCompareCTA` flag.
3. Cross-link strip.
4. Update [MODULES.md](../MODULES.md) Corridor pages row if warranted; check off T16 in plan README and tick remaining corridors-spec acceptance boxes.

## Verify
Each new `/send/<slug>` renders with live table and unique copy; failing candidates 404 (never half-enabled). `/sitemap.xml` lists exactly the enabled set. Harness output included in the final report. `npm test && npm run build && npm run lint`.

## Out of scope
Non-PHP destinations, localized corridor copy, Compare multi-currency support, per-corridor OG images.
