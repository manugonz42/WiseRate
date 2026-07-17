# T36 — Referral code: share link, capture, attribution + referral page

## Dependencies
- **Reads:** [referral module](../modules/referral.md), [auth service](../services/auth.md), `web/middleware.ts` (T34)
- **Task deps:** T34, T35

## Used by
- T37 (rewards read `referred_by` set here)

## Goal
Every user has a share link; visitors arriving through it who later sign up are attributed to the referrer. Rewards money comes in T37 — this task only wires codes, capture, and attribution.

## Pre-made decisions (binding)
- **Share link:** `https://app.sulitsend.com/?ref=<CODE>` — `?ref=` is honored on **every** route (captured client-side in the tabs layout, not middleware, to keep pages static/cacheable).
- **Capture:** on load with `?ref=` present → validate format (8-char Crockford base32) → store `sulitsend.ref.v1 = { code, at }` in localStorage. **Last-touch wins** (a newer ref overwrites), 30-day expiry. No cookie (stays consistent with the consent model — this is functional storage, add it to the /cookies + T32 disclosure list).
- **Attribution at signup:** T35's `signUp()` reads `sulitsend.ref.v1`, sends the code; server resolves code → referrer id, sets `referred_by` **only if**: code exists, referrer ≠ new user, stored-at within 30 days. Invalid/expired code → signup proceeds with `referred_by = null` (never block signup). One-shot: `referred_by` immutable after creation (RLS trigger from T34).
- Signup form also shows an optional "¿Tienes un código de invitación?" text input, prefilled from the stored ref — covers word-of-mouth codes without a link.
- **Referral page:** `/account/referral` — the user's code (large, copy button + toast), share button (Web Share API, clipboard fallback), localized message, stats card: invited count (`count(referred_by = me)`) + rewards summary (zeros until T37). "Cómo funciona" bottom sheet with the program terms (draft copy, marked DRAFT pending legal).
- Analytics: `referral.link_captured`, `referral.shared { channel }`, `referral.attributed` (consent-gated).

## Steps
1. Spec first: rewrite `docs/modules/referral.md` web section (real service replaces mock; drop `MARIA2024`; deep link for web = `?ref=`, keep `wiserate://?ref=` noted for apps); MODULES.md Referral web → ◐.
2. Capture hook + persistence keys; signup wiring; server attribution logic in the signup route (service role).
3. `/account/referral` page.
4. Vitest: capture expiry/overwrite logic, attribution guards (self-referral, expired, unknown code).

## Verify
- Playwright: visit `/?ref=CODE` of user A → sign up user B → Supabase shows B.`referred_by` = A; A's page shows invited = 1. Self-referral attempt leaves `referred_by` null. Signup with garbage code still succeeds.
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No monetary rewards, no click tracking, no payout UI (T37). No app-store deep links. No emails.
