# T32 — Legal drafts: disclose all local storage introduced by T28–T31

## Dependencies
- **Reads:** `web/app/privacy/page.tsx`, `web/app/cookies/page.tsx`, `web/app/terms/page.tsx`, `web/lib/services/persistence.ts`, `web/lib/consent.ts`
- **Task deps:** T28–T31 (the keys must exist first)

## Used by
- Legal accuracy of the drafts; the human legal-review checklist item (plan README)

## Goal
`A_mejorar.md` item 13, codeable part. The /privacy and /cookies **drafts** must accurately enumerate every piece of browser storage the site now uses. Finishing the pages (removing DRAFT status) remains **human-only** — legal review, see README checklist. Do not remove any DRAFT banner or `TODO(human)`.

## Pre-made decisions (binding)
- Source of truth: grep `sulitsend.` across `web/` and list every localStorage key found (expected after T31: `alerts.v1`, `favorites.v1`, `providerAccounts.v1`, `locale.v1`, `defaultAmount.v1`, `onboarded.v1`, plus the consent key in `consent.ts` — verify, don't assume).
- /cookies: the localStorage section gets a table: key · purpose (one plain-English line) · lifetime ("until you clear it") · category ("functional — no tracking, never sent to us or third parties"). State explicitly that functional localStorage requires no consent banner and that analytics remain consent-gated (PostHog, unchanged).
- /privacy: mirror the same list briefly under local-data handling; note that provider-account ticks and preferences never leave the browser.
- Keep the pages' existing structure/tone; English only (legal pages are out of i18n scope per T29).

## Steps
1. Grep + enumerate keys (record the final list in this file when executing).
2. Update both pages.

## Verify
- Every key from the grep appears on /cookies; no key listed that doesn't exist in code. DRAFT banners still present. `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No legal-review sign-off, no new policy sections, no cookie-consent changes, no /terms rewrite (only touch it if it mentions storage inaccurately — otherwise leave it).
