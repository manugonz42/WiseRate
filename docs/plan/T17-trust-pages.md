# T17 — Trust & transparency pages

## Dependencies
- **Reads:** `web/app/privacy/page.tsx` (layout/style to mirror), `web/lib/site.ts`, `web/app/(tabs)/layout.tsx` (footer), `web/app/sitemap.ts`
- **Task deps:** none (first task of the launch-readiness slice)

## Used by
- Affiliate-network reviewers (Partnerize, CJ, FlexOffers, Impact) — they check for about page, contact, disclosure, terms before approving
- T20 deploy, T21 QA

## Goal
Ship the credibility pages every affiliate program looks for: `/about`, `/how-we-make-money` (affiliate disclosure), `/terms` (DRAFT), a visible contact email, and an inline disclosure line next to every outbound CTA.

## Pre-made decisions
- **Three new static routes**, server components, same visual pattern as `/privacy` (prose card, dark tokens). All get metadata via existing plumbing (title, description, canonical) and entries in `app/sitemap.ts`.
- **`/about` content (write it, don't stub):** what SulitSend is (independent comparison for sending money from Europe to the Philippines); how the data works (quotes fetched live from provider endpoints + Wise Comparisons API as attributed filler, refresh cadence from the cache TTL in `web/lib/services/cache.ts`); how ranking works (sorted by what the recipient gets — **no provider pays for position**); who runs it (one-person project, contact email). Honest, first-person-plural, no invented team/office.
- **`/how-we-make-money`:** plain-language affiliate disclosure — some provider links are/will be affiliate links, commission paid by the provider, never affects the rate shown or the ranking, comparison stays free. This is the page the inline disclosure links to.
- **`/terms`:** DRAFT banner identical in style to `/privacy`'s — no financial advice, rates are informational and can differ at the provider, no warranty on accuracy, liability limits, governing law Spain. Add to the legal-review item in the human checklist.
- **Contact email:** `export const CONTACT_EMAIL` in `web/lib/site.ts`, default `"TODO(human)"` — render it visibly flagged (same treatment as the `/privacy` TODO) on `/about` and `/terms`. Replace the hardcoded `TODO(human)` span in `/privacy` with the constant so the human fixes one place.
- **Inline disclosure line** (one short sentence + link to `/how-we-make-money`): under the quotes table on Compare, near the CTA block on Provider Detail, and under the brokers card. Muted `text-text-tertiary`, not a banner.
- **Footer** (`(tabs)/layout.tsx`): add About · How we make money · Terms links alongside Privacy · Cookies.

## Steps
1. `CONTACT_EMAIL` in `lib/site.ts`; swap `/privacy`'s hardcoded TODO to it.
2. Build `/about`, `/how-we-make-money`, `/terms` with real copy per decisions above.
3. Footer links + sitemap entries.
4. Inline disclosure line on Compare, Provider Detail, brokers card.
5. Docs: one line in [platforms/web.md](../platforms/web.md) (trust pages list); add "set real contact email (`CONTACT_EMAIL`) + legal review of /terms" to the human checklist in plan README; check off T17.

## Verify
All three pages render, appear in `/sitemap.xml`, footer links navigate. Disclosure line visible on Compare + provider page. `npm test && npm run build && npm run lint`.

## Out of scope
Real contact email value (human), legal review (human), landing-page equivalents (landing already has its own footer/legal scope).
