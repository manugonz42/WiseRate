# T09 — Privacy policy, cookie notice, footer

## Dependencies
- **Reads:** [ROADMAP](../ROADMAP.md) Phase 1 (DIY legal), [landing module](../modules/landing.md) (the landing has its own footer — this task is `web/` only)
- **Task deps:** none

## Used by
- Launch requirement; T10 gates analytics on the consent state set here

## Goal
Static `/privacy` and `/cookies` pages, a consent banner, and a small app footer linking them.

## Pre-made decisions
- Pages: `web/app/privacy/page.tsx`, `web/app/cookies/page.tsx` — server components, plain typographic layout, English only (i18n is Phase 5). Top of each file: `{/* DRAFT — human/legal review required before launch (ROADMAP Phase 1) */}` and a visible "Last updated: <date>" line.
- Content to generate (standard comparison-site policy, first person plural, SulitSend brand): who we are (independent comparison site, **not** a payment institution; transfers happen on providers' sites), what we collect (product analytics events, consent state; no accounts, no transfer data), affiliate disclosure (we may earn commissions from providers/brokers; ranking is never affected — always the standard no-promo price), cookies/storage table (`sulitsend.consent.v1`, `sulitsend.alerts.v1`, analytics — filled by T10), user rights (GDPR basics, contact email placeholder `TODO(human)`).
- Consent banner: `web/components/ConsentBanner.tsx`, client component mounted in `web/app/layout.tsx`. Bottom bar: short copy + "Accept analytics" / "Decline" → `localStorage sulitsend.consent.v1 = "granted" | "denied"`; hidden once answered. Export `export function getConsent(): "granted" | "denied" | null` from `web/lib/consent.ts` for T10.
- Footer: minimal bar in `web/app/(tabs)/layout.tsx` below `{children}`: "© 2026 SulitSend · Independent comparison site, not a payment institution · Privacy · Cookies" (links).

## Steps
1. Build `web/lib/consent.ts` + `ConsentBanner` (SSR-safe).
2. Write both pages with the content outline above.
3. Add the footer; verify `/privacy` and `/cookies` are reachable from it.
4. Check off T09 in the plan README (no MODULES.md row — not a module).

## Verify
Banner shows on first visit, choice persists across reloads, both pages render and are linked. `npm run build && npm run lint`.

## Out of scope
es/tl translations, Termly/iubenda integration, landing-site (`landing/`) legal pages, actually loading analytics (T10).
