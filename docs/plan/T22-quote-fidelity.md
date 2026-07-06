# T22 — Quote fidelity: replace Wise Comparisons with direct per-provider sources + promo surfacing

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md) (source table, aggregation rules), [proveedores](../proveedores.md) ("100% fiables" list), [comparison](../modules/comparison.md), `web/lib/services/quotes.ts`, `web/lib/services/providers/`
- **Task deps:** T19 enumeration (the per-corridor provider lists are the coverage target)

## Used by
- Comparison list (fewer "via Wise" rows), provider detail pages, affiliate credibility (our numbers must match each provider's own calculator)

## Goal
For an input send amount X, the comparator returns the **exact PHP the recipient gets, all fees included, quoted by each provider's own source at that exact amount** — because fees and FX margins change with amount, a quote is only valid for the amount it was requested with. Today only Wise / Western Union / Remitly / TransferGo meet this bar; everyone else is Wise-Comparisons filler.

**Decision (2026-07-06, revised same day):** direct sources are the goal — we don't trust Comparisons' competitor numbers (live check 2026-07-02: WU ~630 PHP off on €1,000) — but **providers we can't source ourselves yet stay via Wise Comparisons for now**, always tagged "via Wise". **Banks are the exception: a bank stays listed only if a referral/affiliate deal is possible with it; otherwise it's dropped** — an unmonetizable row built on numbers we distrust has no reason to exist. Full removal of Comparisons is the eventual end state (see Deferred), reached by expanding direct coverage, not by cutting rows.

## Pre-made decisions
- **Definition of "reliable":** quote fetched from the provider's own service for the requested amount; `receiveAmount` normalized as "sender pays exactly X in total" (existing rule in `quotes.ts`).
- **Step 1 output is a classification table** (kept in this file, later promoted to `docs/services/provider-sources.md`): for every provider in proveedores.md "100% fiables" (∪ T19 corridor lists as candidates), classify:
  - **A — own public quote endpoint**, official or the XHR behind their public calculator (how the existing 4 work): implement a parser. Expected here: MoneyGram, WorldRemit, Xoom, Instarem, XE, Ria, Paysend, OFX — verify each, don't assume.
  - **B — calculator only renders server-side / behind bot protection → real scraping (headless)**: list only; **do not build scrapers yet** — blocked on the legal/ToS check already flagged in exchange-rate.md open questions (affiliate/partnership first).
  - **C — no programmatic source**: stays via Wise Comparisons, tagged "via Wise" (current behavior). **Banks in tier C** (ABN AMRO, BNP, UniCredit, Barclays, Wells Fargo…): research per bank whether any referral/affiliate program covers international transfers — keep only banks with a confirmed program (record evidence + URL here, dated); drop the rest via an exclusion list in `quotes.ts`. Realistic expectation: most banks have none and will be dropped.
- **Mid-market reference** keeps coming from the comparisons response while the source lives; the Wise-direct fallback already documented in exchange-rate.md covers eventual removal.
- **Priority for tier A implementation:** EUR→PHP default list first (MoneyGram, WorldRemit, Xoom, Instarem, Paysend, XE…), then other "100% fiables" (Ria, Moneytrans, Small World). Per parser: `buildRequest`/`parseX`/`fetchX` split + committed fixture + vitest, same as T01; wire into `Promise.allSettled` aggregation, direct-precedence over the comparisons row, and `/api/health`.
- **Promos are part of fidelity:** every new parser must detect first-transfer pricing and populate `PromoInfo` (Remitly pattern). Extend `PromoInfo` with `kind: "first-transfer" | "referral" | "other"` + optional `conditions` string.
- **Referral promos** (bonus for using our link) are editorial data, not API data: add fields to `web/lib/data/providers.ts` per provider (amount/conditions/source URL, dated comment). UI shows them alongside API promos.
- **Comparator UI:** promo availability is separated and flagged — row shows standard price as the ranked number (unchanged rule), plus a distinct promo line/badge per kind ("first transfer" vs "via our link") so the user is *notified* the promo exists and what it's worth. Both shown to everyone for now (no per-user eligibility yet — see Deferred).
- Spec updates land with the code: exchange-rate.md source table + comparison.md acceptance criteria (+ data-model if `PromoInfo` grows).

## Steps
1. Classify all providers (A/B/C) — record the table here with endpoint URLs/evidence per tier-A candidate, verified by requesting a real quote at 2+ amounts.
2. Implement tier-A parsers (batch; fixture test each; health source each) — each new direct parser takes precedence over its comparisons row, as today.
3. Bank referral audit: per tier-C bank, confirm or rule out a referral/affiliate program (evidence here, dated); add banks without one to an exclusion list in `quotes.ts`.
4. `PromoInfo.kind` + referral fields in `providers.ts` + comparator promo separation UI.
5. Update specs (exchange-rate.md source table, comparison.md, MODULES.md); revisit T19's must-write list — excluded banks drop out of it; check off in plan README.

## Verify
For each new direct provider: quote at 100 / 500 / 1000 / 5000 EUR→PHP matches the provider's own public calculator (document the manual check in this file, dated). `/api/quotes`: remaining comparisons rows still carry the "via Wise" tag; excluded banks absent from every corridor; mid-market rate still populated. `/api/health` reports every new source. `npm test && npm run build && npm run lint`.

## Completion (2026-07-06)

**Step 1 (classification)** — full A/B/C table for every candidate now lives in [exchange-rate.md](../services/exchange-rate.md#t22-classification-record-2026-07-06) rather than duplicated here. Researched via real curl/WebFetch/WebSearch against each provider's live endpoints (not assumed): MoneyGram, WorldRemit, Xoom, Instarem, XE, Ria, Paysend, OFX, Moneytrans, Small World, CurrencyFair, Revolut. **Only CurrencyFair cleared tier A** — every other candidate is tier B (bot-walled: MoneyGram/WorldRemit/Xoom/Ria/Moneytrans/Revolut) or tier C (login-gated: XE/OFX/Paysend; or defunct: Small World/Sigue, both ceased operating in 2026). The "expected tier A" list in the pre-made decisions above did not hold up under verification — a useful reminder that bot-protection has tightened across the industry since the original 4 parsers were built.

**Step 2 (implement)** — `web/lib/services/providers/currencyfair.ts` (`buildRequest`/`parseCurrencyFair`/`fetchCurrencyFair`), fixture `__fixtures__/currencyfair.eur-php-1000.json`, vitest in `__tests__/currencyfair.test.ts`. Wired into `quotes.ts`'s `Promise.allSettled` aggregation (direct-precedence over its — nonexistent — comparisons row, since CurrencyFair wasn't previously surfaced at all), `/api/health`, and `scripts/capture-fixtures.mjs`. Editorial profile added to `providers.ts` (Trustpilot 4.5/5, ~12,100 reviews, and fee/limit facts sourced from businessexpert.co.uk, both dated 2026-07-06).

**Manual verify (2026-07-06):** hit `api.currencyfair.com/comparisonQuotes` directly (the same call CurrencyFair's own calculator makes — this *is* the provider's own source, not a scrape) at €100 / €1,000 / €5,000: rate held constant (69.85), fee normalized correctly at each amount, `receiveAmount` scaled linearly as expected. `/api/quotes?from=EUR&to=PHP&amount=1000` and `/api/health` confirmed live via local dev server; `/compare` verified in a real headless-Chromium pass (CurrencyFair row renders, promo badge reads "FIRST TRANSFER").

**Step 3 (bank referral audit, 2026-07-06)** — researched all 5 banks currently in `providers.ts` (abn-amro-bank, bnp, unicredit, wells-fargo, hsbc-australia) via WebSearch across each bank's own site plus Awin/Pepperjam/Conversant/Rakuten affiliate-network listings. **None have a program relevant to international transfers** — UniCredit and HSBC (via HSBC Expat) have referral schemes, but both target new account-opening, not FX/remittance traffic. All 5 added to `EXCLUDED_PROVIDER_IDS` (`quotes.ts`) and removed from `providers.ts`; `filterExcludedProviders()` strips them from the Wise Comparisons response before aggregation, so they never appear tagged "via Wise" or anywhere else. Monese was left alone — Wise's comparisons API tags it `type: "bank"`, but it's a mobile-banking fintech, not a traditional retail bank, and wasn't in this audit's scope (proveedores.md's "100% fiables" bank list); revisit only if it's later treated the same way.

**Step 4 (promo kind + referral UI)** — `PromoInfo.kind: "first-transfer" | "referral" | "other"` + optional `conditions` added to `types.ts`; Remitly and TransferGo's existing promos tagged `kind: "first-transfer"`. New `ReferralPromo` type (`amount`/`conditions`/`sourceURL`) added as an optional field on `ProviderDetail`, following the same `affiliateURL: null`-until-real convention — **left unpopulated for every provider**, since no affiliate deal is signed yet (human checklist item in plan README); inventing bonus amounts would violate the no-invented-facts rule. `compare/page.tsx`'s `PromoTag` now labels by kind ("FIRST TRANSFER" vs "REFERRAL"); a new `ReferralTag` renders "VIA OUR LINK: {amount}" from `providers.ts` `referralPromo` whenever one exists (currently never, until real data lands).

**Step 5 (specs)** — updated: [exchange-rate.md](../services/exchange-rate.md) (source table + classification record + health source list), [comparison.md](../modules/comparison.md) (acceptance criteria), [data-model.md](../architecture/data-model.md) (`PromoInfo.kind`/`conditions`, new `PromoKind`/`ReferralPromo` entities, `TransferProvider.referralPromo`). T19's scope note resolved inline in its own file. MODULES.md needed no status change (Comparison/Provider Details stay ✅; Exchange Rate API stays ◐). `npm test` (44 passed), `npm run build`, `npm run lint` all green.

**Deviation from the original plan:** step 1's "priority for tier A implementation" assumed MoneyGram/WorldRemit/Xoom/Instarem/Paysend/XE would yield several new parsers; in practice only CurrencyFair (a secondary-priority candidate) did. This narrows near-term impact — most of the EUR→PHP list stays "via Wise" — but the audit itself is real, dated, evidence-backed work per provider, not a shortcut.

## Deferred (annotated now, deliberately not in scope)
- **Per-provider fee-curve study:** map how fee/margin varies with amount per provider. If a provider prices by amount *ranges*, derive any amount locally from the range table (no per-amount request); if continuous, schedule periodic prefetch of the most-requested amounts and keep them warm in KV ("in stock") to answer instantly. Each provider differs → one follow-up task per provider after T22's table exists.
- **Per-user promo eligibility:** store in each user's DB record whether they can still claim first-transfer / referral promos (already has a provider account, already used a referral link, …) and personalize the comparator. Requires accounts/persistence (Phase 3+). Until then both prices show for everyone.
- Tier-B scrapers (blocked on legal/ToS + affiliate status per provider).
- **Full removal of Wise Comparisons**: once direct coverage makes the remaining "via Wise" rows negligible, kill the source, its tag/UI and fixture, and switch the mid-market ref to Wise direct. Not scheduled — revisit after tier-A parsers land.
