# T19 — Editorial profiles for every visible provider

## Dependencies
- **Reads:** `web/lib/data/providers.ts`, `web/lib/services/providers/`, corridors registry (`web/lib/` — see [corridors](../modules/corridors.md)), [provider-details](../modules/provider-details.md)
- **Task deps:** T18 (generic fallback is now honest, so this task is about eliminating how often it's hit)

## Used by
- Provider detail pages, sitemap (driven by `PROVIDERS` ids), corridor pages' provider links, affiliate reviewers checking content depth

## Goal
No provider that appears in a default compare list lands on the "no full profile yet" fallback. Today only Wise / Remitly / Western Union / TransferGo have profiles; Wise-Comparisons filler surfaces more.

## Pre-made decisions
- **Enumerate first, then write:** start the dev server and hit `/api/quotes` for each live corridor (EUR/GBP/USD/CAD/AUD→PHP, default amount 1000) — the union of returned `providerID`s minus existing `PROVIDERS` keys is the work list. Expect names like Paysend, WorldRemit, Instarem, Xoom, MoneyGram, XE — but the API result is authoritative, not this guess.
- **Profile bar:** description, transfer limits, fees, delivery methods, 3–5 pros/cons — written from the provider's public site/help pages, same tone and length as the existing four. No invented facts: anything unverifiable is omitted, not guessed.
- **Ratings:** `userRating`/`reviewCount` from the provider's public Trustpilot page (rounded, count to nearest hundred), with a dated source comment in the file. If no Trustpilot presence, set both to 0 — T18 already hides zeros. `trustScore` editorial, consistent with the existing scale (Wise .98 … TransferGo .88).
- **`affiliateURL` stays `null` everywhere** — the human pastes real links per `SolicitarAfiliados.md` (repo root).
- Providers appearing in only one non-EUR corridor and outside its top 5 by receive amount may be skipped — cap effort; note skips in the completion record.

## Steps
1. Enumerate provider ids per corridor (script or manual curl; note the result in this file when done).
2. Write missing profiles in `providers.ts` (batch, one commit).
3. Confirm sitemap picks up new ids (it maps `PROVIDERS`), and corridor/compare provider links resolve to profiled pages.
4. Update [provider-details](../modules/provider-details.md) platform note with the new coverage; check off T19 in plan README.

## Verify
For each id in the default EUR→PHP compare list: `/provider/{id}` renders a full profile (no fallback copy). `npm test && npm run build && npm run lint`.

## Out of scope
Affiliate URLs (human), provider-vs-provider comparison pages, translating profiles.

## Progress (2026-07-06)

Step 1 (enumerate) is done — dev server was up on :3000, hit `/api/quotes` for all 5 corridors at amount 1000:

- EUR→PHP: abn-amro-bank, bnp, instarem, monese, moneygram, ofx, paypal, remitly, transfergo, unicredit, western-union, wise, world-remit, xoom
- GBP→PHP: barclays, hsbc, instarem, monese, moneygram, nationwide, ofx, paypal, remitly, western-union, wise, world-remit, xoom
- USD→PHP: bank-of-america, instarem, moneygram, ofx, paypal, remitly, wells-fargo, wise, xoom
- CAD→PHP: bmo, instarem, ofx, paypal, western-union, wise, xoom
- AUD→PHP: anz, commonwealth-bank-of-australia, hsbc-australia, national-australia-bank, ofx, paypal, remitly, western-union, wise, xoom

Top 5 by receiveAmount per corridor (for the skip rule):
- EUR: instarem, wise, moneygram, world-remit, transfergo
- GBP: instarem, wise, world-remit, remitly, moneygram
- USD: xoom, instarem, moneygram, wise, wells-fargo
- CAD: western-union, instarem, wise, xoom, paypal
- AUD: xoom, western-union, wise, remitly, hsbc-australia

Applying the pre-made decisions (existing `PROVIDERS` keys — wise, remitly, western-union, transfergo — excluded; EUR is the default compare corridor so every EUR provider is mandatory regardless of rank; a non-EUR-only provider outside its corridor's top 5 may be skipped):

**Must write (12):** abn-amro-bank, bnp, instarem, monese, moneygram, ofx, paypal, unicredit, world-remit, xoom (all appear in EUR), plus wells-fargo (USD-only but top-5) and hsbc-australia (AUD-only but top-5).

**Skip candidates (8, non-EUR-only and outside top 5 — note in completion record if actually skipped):** barclays, hsbc, nationwide (GBP-only), bank-of-america (USD-only), bmo (CAD-only), anz, commonwealth-bank-of-australia, national-australia-bank (AUD-only).

**Blocked on step 2 (write profiles):** WebSearch/WebFetch were returning `529 Overloaded` for ~20 min straight (2026-07-06 ~09:00–09:25) — a genuine Anthropic-side outage, not a query problem. Could not pull Trustpilot ratings/review counts or verify fee structures for the 12 "must write" providers, so no profile was written to avoid inventing facts. Resume from here: re-run the 12 provider research (description, transfer limits, fees, delivery methods, 3–5 pros/cons, Trustpilot rating rounded + review count to nearest hundred with dated source comment, editorial trustScore consistent with existing 0.88–0.98 scale) and add entries to `web/lib/data/providers.ts`, then continue with steps 3–4.

**Retried same day:** still `529 Overloaded` on a single test query (Instarem Trustpilot). Per user instruction, not retrying further this session — T19 stays blocked/open, proceeding to T21 with only the existing 4 profiles (wise, remitly, western-union, transfergo). T21 will test a generic-fallback provider id instead of a "T19-added id," and Provider Details module status will NOT flip to ✅ (still ◐, thin editorial coverage).
