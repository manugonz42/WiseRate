# T21 — Full QA sweep + status flip

## Dependencies
- **Reads:** plan README Playwright recipe, every route shipped by T12–T20, [MODULES.md](../MODULES.md)
- **Task deps:** T17–T20 all done (this is the gate)

## Used by
- The human's go/no-go to deploy and start affiliate applications

## Goal
Drive every page like a reviewer would, on phone and desktop viewports, fix everything found, then flip MODULES.md so the docs stop underselling the web app.

## Pre-made decisions
- **Playwright script** (scratchpad or `web/scripts/`, not committed if throwaway) over the full route list: `/home`, `/compare` (default + amount ≥ €5,000 for the brokers card + a sort change + a search), `/analytics` (range switch), `/alerts` (create → edit → delete an alert), `/provider/wise` + one T19-added id, every `/send/*` corridor, `/about`, `/how-we-make-money`, `/terms`, `/privacy`, `/cookies`, a 404 URL — and the landing (`/en`, `/es`, `/tl`, switcher click).
- **Two viewports:** 390×844 and 1440×900.
- **Assertions per page:** zero console errors/warnings-as-errors, no text `mock`, no text `TODO` (except the flagged `TODO(human)` contact email if still unset — report it, don't fail), no horizontal overflow on mobile (`document.documentElement.scrollWidth <= innerWidth`), all internal links respond 200, outbound provider/broker links are `https` and open the expected host.
- **Recipe caveats apply** (plan README): `domcontentloaded`, wait for hydration before typing.
- **Fix everything found in this task** — visual bugs, console noise, dead links. If a finding is genuinely out of MVP scope, it goes to the plan README as a named follow-up, not silently dropped.
- **MODULES.md flip (spec-first rule):** web column → ✅ for Home, Comparison, Provider Details, Analytics, Brokers, Landing (module acceptance criteria permitting — re-read each spec's checklist first). Alerts stays ◐ (delivery is Phase 3). Profile/Settings/Premium/Referral/Onboarding already re-marked in T18.
- **Screenshots** of every page/viewport saved outside the repo; final report lists path + per-page pass/fail.

## Steps
1. Script the sweep; run against `npm run dev` (note the port).
2. Fix findings; re-run until clean.
3. MODULES.md + affected module-spec status lines.
4. Check off T21; move anything deferred into a "follow-ups" list in plan README.

## Verify
Sweep passes clean on both viewports. `npm test && npm run build && npm run lint` (web) + `npm run build` (landing).

## Out of scope
Lighthouse/perf tuning, cross-browser beyond Chromium, accessibility audit beyond obvious breakage.
