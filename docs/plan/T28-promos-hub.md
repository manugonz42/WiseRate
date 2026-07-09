# T28 — Promos hub: /promos page, promo search, "my provider accounts" (localStorage)

## Dependencies
- **Reads:** [comparison](../modules/comparison.md) (promo badge conventions), [navigation](../architecture/navigation.md), [analytics service](../services/analytics.md), `web/lib/data/providers.ts`, `web/lib/models/types.ts`, `web/lib/services/persistence.ts`, `web/app/(tabs)/layout.tsx`
- **Task deps:** T22 (promo model), T27 (compare stabilized)

## Used by
- `A_mejorar.md` items 9 + 10; T30 (settings reuses the accounts component), T31 (onboarding step 3)

## Goal
One place listing every known promo (API-detected first-transfer promos + editorial `referralPromo`s), searchable, personalized by which providers the user **already has an account with** (stored locally — decision 2026-07-09: no auth/backend; real accounts stay ROADMAP Phase 5).

## Pre-made decisions (binding)
- **Spec first:** create `docs/modules/promos.md` (~1 page, `## Dependencies`/`## Used by` after the title) describing the below, and add a `Promos` row to MODULES.md (web ✅ when this lands, iOS/Android ☐).
- **Navigation:** Promos becomes the 5th web tab. Update `docs/architecture/navigation.md` web note (web ships 5 tabs), then `web/app/(tabs)/layout.tsx`: add `{ label: "Promos", icon: Tag, href: "/promos" }` to `TABS` (`Tag` from phosphor) and change the bottom bar `grid-cols-4` → `grid-cols-5`. All three nav renderings iterate `TABS`, so no other nav edits.
- **Route:** `web/app/(tabs)/promos/page.tsx` (client) + `layout.tsx` with metadata (title "Promos — SulitSend", copy the pattern of the other tab layouts).
- **Data:** call `getQuotes(1000)`; promos = every quote with `promo` set (kind `first-transfer`), plus every `PROVIDERS` entry with `referralPromo` (kind `referral`). One card per promo:
  - provider icon + name, kind badge (reuse compare's labels: FIRST TRANSFER / REFERRAL, same colors),
  - description + conditions (from `PromoInfo` / `ReferralPromo` — **never invent or embellish amounts**),
  - value line: first-transfer → `+₱{promoReceiveAmount − receiveAmount} on €1,000` (only when `baseIsStandard`, else show the promo receive amount with the "no standard price" caveat); referral → the `amount` string verbatim,
  - CTA "Claim" → `affiliateURL ?? websiteURL`, `target="_blank" rel="sponsored noopener"`, tracks `promos.affiliate_outbound { providerID }`.
- **Search:** text input above the list, 150 ms debounce (copy compare's pattern), matches provider name + description, case-insensitive. Empty state with a reset button.
- **My provider accounts:** section "Which providers do you already use?" — checkbox per provider in `PROVIDERS` (sorted by name). Persistence in `web/lib/services/persistence.ts`, same conventions as alerts: key `sulitsend.providerAccounts.v1`, `listProviderAccounts(): string[]`, `toggleProviderAccount(id: string): string[]`. Build the checkbox UI as `web/components/ProviderAccounts.tsx` (T30/T31 reuse it).
- **Eligibility rule:** first-transfer promo + user has that provider checked → card stays visible but dimmed (`opacity-60`) with note "You already have an account — first-transfer pricing usually won't apply". Referral promos are never dimmed. Compare page stays untouched (per-user eligibility there = deferred, see T22 Deferred).
- **Analytics events:** `promos.search` (debounced, `{ queryLength }` only), `promos.account_toggled { providerID, checked }` — via the existing `track()`, consent-gated automatically.
- Dark theme tokens only; UI copy says SulitSend.

## Steps
1. Write `docs/modules/promos.md` + MODULES.md row + navigation.md web note.
2. persistence.ts functions + `ProviderAccounts.tsx`.
3. Page + layout + tab wiring.
4. Analytics events.

## Verify
- Playwright at 1280px and 390px: /promos renders ≥1 first-transfer card (Remitly/TransferGo/CurrencyFair publish them); search narrows and resets; checking "Remitly" dims its first-transfer card and survives reload; 5 tabs render on all three breakpoints without overflow.
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No auth, no backend, no cookies, no server persistence. No promo amounts that don't come from the API or `providers.ts`. No changes to compare/home. No sitemap entry (tab pages aren't in the sitemap — check how the other tabs handle it and match).
