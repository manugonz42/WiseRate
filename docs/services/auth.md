# Service: Auth

Identity + accounts. Web only (T34, 2026-07-17) — Supabase Auth + Postgres, EU region. No separate backend.

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md) (`UserProfile` accounts-backed fields), [persistence](persistence.md) (anonymous fallback stays local-only, unaffected)
- **Future:** ⏳ iOS/Android accounts (Phase 5-proper, not scheduled)

## Used by
- [referral](../modules/referral.md) — referral code + attribution (T36/T37)
- [profile](../modules/profile.md) — `/account` (T35)

## Stack
- **Supabase Auth**: email + password, email confirmation ON. No OAuth (Google deferred, decided 2026-07-17), no NextAuth.
- **Supabase Postgres**, EU region. **RLS on every table**, no exceptions.
- Web libs: `@supabase/supabase-js` + `@supabase/ssr` (cookie-based sessions).

## Entities (Postgres tables, `web/supabase/migrations/`)

| Table | Notes |
|---|---|
| `profiles` | 1:1 with `auth.users` (`id` FK, cascade delete). Holds the accounts-backed `UserProfile` fields (see data-model.md) + `referral_code` (unique, server-generated), `referred_by` (self-FK), `terms_accepted_at`/`terms_version`, optional signup extras `providers_used`/`heard_from`. |
| `affiliate_clicks` | `id`, `user_id?`, `provider_id`, `created_at`. Exists from day 1; populated by T37 (sub-ID click tracking). |
| `referral_rewards` | `id`, `referrer_id`, `referred_id?`, `click_id?`, `kind` (`signup`\|`conversion`), `provider_id?`, `event_type?` (`lead`\|`sale`), `amount?`, `currency?`, `status` (`pending`\|`confirmed`\|`rejected`\|`redeemed`), `external_ref?`, `created_at`. Per-referred detail lives here; the referrer's UI only ever shows aggregates (privacy — see T37). |

## RLS

- `profiles`: user selects/updates own row only. `referral_code`, `referred_by`, `terms_accepted_at` are **not** client-updatable (trigger rejects the update).
- `affiliate_clicks` / `referral_rewards`: user reads rows where they are the referrer/owner; all inserts are server-only (service role).

## Referral code

Generated server-side at profile creation: 8 chars, Crockford base32 alphabet (excludes `0 O 1 I`), uppercase, retry on collision. Satisfies [referral.md](../modules/referral.md)'s "uppercase 6–10 chars".

## Service layer

`web/lib/services/auth.ts` exposes `signUp`, `signIn`, `signOut`, `getSession`, `onAuthStateChange`, `getProfile`, `updateProfile`, `requestPasswordReset`, `updatePassword`. Components never import Supabase clients directly — same wiring rule as [persistence](persistence.md). Client/server Supabase helpers live in `web/lib/supabase/{client,server}.ts`.

## Session / middleware

`web/middleware.ts` refreshes the Supabase session cookie and redirects unauthenticated `/account/*` → `/login`. No other route is touched.

## Anonymous fallback

Logged-out users keep today's localStorage persistence exactly as-is ([persistence](persistence.md)) — the affiliate compare flow never gains a login wall. Server sync of alerts/favorites for logged-in users is a follow-up, not scheduled.

## Per-platform impl

| Platform | Status |
|---|:-:|
| Web | ◐ — auth wired (T34), signup/login/reset/account UI (T35); referral attribution (T36) |
| iOS | ☐ — Phase 5-proper |
| Android | ☐ — Phase 5-proper, frozen |
