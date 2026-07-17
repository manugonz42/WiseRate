# T35 — Signup / Login / Account UI (web)

## Dependencies
- **Reads:** [auth service](../services/auth.md) (T34), [profile module](../modules/profile.md), [design-system](../architecture/design-system.md), `/privacy` + `/terms` drafts
- **Task deps:** T34

## Used by
- T36 (referral page hangs off /account)

## Goal
Registration, login, and account pages. Signup collects exactly the approved fields; everything else stays optional/later. Zero impact on anonymous flows.

## Pre-made decisions (binding)
- **Routes:** `/signup`, `/login`, `/reset-password`, `/account` (profile view/edit + logout + delete account). Not tabs — entry is a person-circle icon button in the same three header spots as the T29/T30 controls (avatar initials when logged in).
- **Signup fields (confirmed 2026-07-17):**
  1. Nombre + Apellidos — two separate text inputs, required, trimmed, 1–60 chars.
  2. Email + password (Supabase, password ≥ 8 chars) — email confirmation required before login completes.
  3. **Fecha de nacimiento** — one text input, typeable with `DD/MM/YYYY` mask, plus calendar icon opening a **custom lightweight calendar popover** (month/year selects + day grid; no new npm dep). Typing and picking stay in sync. Client+server validation: valid date, age ≥ 18.
  4. **País de residencia** — searchable dropdown: text input filters a static ISO 3166-1 list committed at `web/lib/data/countries.ts` (code + en/es names, no dep). Keyboard navigable, `aria` combobox pattern.
  5. **Checkbox** "Quiero recibir novedades y avisos por email" — **unchecked by default** (GDPR), maps to `email_notifications`.
  6. **Checkbox** terms — required, blocks submit, links to `/terms` + `/privacy`; stores `terms_accepted_at` + `terms_version`.
- **Optional extras (decided 2026-07-17)** — collapsed "Opcional" section, never required, skippable entirely; exactly these two:
  - **Proveedores donde ya tienes cuenta** — multi-select chips from the `providers.ts` list → `profiles.providers_used`. If T28 shipped, prefill from its localStorage keys and keep both in sync on save.
  - **¿Cómo nos conociste?** — select (`search | friend | social | youtube | other`) → `profiles.heard_from`. Preselect `friend` when a `?ref` capture (T36 key) is present.
- **Delete account:** button in /account with confirm dialog → server route using service role → `auth.users` delete cascades `profiles` (GDPR art. 17). Rewards rows keep `referrer_id` but `referred_id` nulls via FK `on delete set null`.
- Forms: client validation inline (Pistacho error tokens), server errors surfaced verbatim, submit disabled while pending. Strings: follow the i18n state at execution time (T29 shipped → keys `auth.*` en/es; else hardcoded en like current pages).
- `/privacy` DRAFT gains a "Datos de cuenta" section (name, DOB, country, email — purpose + retention); stays DRAFT for human legal review.

## Steps
1. Spec first: update `docs/modules/profile.md` (web section: /account, fields, delete) + MODULES.md Profile web → ◐.
2. `countries.ts` + calendar + combobox components (`web/components/auth/`).
3. Pages + wiring to `auth.ts`; analytics events `auth.signup`, `auth.login` (consent-gated like the rest).
4. Privacy draft section.

## Verify
- Playwright: full signup (typed DOB *and* picked DOB), under-18 rejected, terms unchecked blocks, country search "esp" → España, login/logout, /account edit + save, delete account removes login. Anonymous tabs unaffected.
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No referral code UI (T36). No OAuth. No avatar upload. No email sending beyond Supabase's built-in confirmation email. No localStorage→server data migration.
