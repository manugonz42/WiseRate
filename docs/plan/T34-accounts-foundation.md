# T34 — Accounts foundation (Supabase auth + schema, web only)

## Dependencies
- **Reads:** [persistence](../services/persistence.md), [data-model](../architecture/data-model.md), [ROADMAP](../ROADMAP.md) Phase 5 (accounts pulled forward — see plan README note), `web/lib/services/persistence.ts`
- **Human prerequisite (blocking):** Supabase project created (Free plan, **EU region** — GDPR, same criterion as PostHog EU) and env vars set locally + in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only, never `NEXT_PUBLIC_`).

## Used by
- T35 (signup UI), T36 (referral attribution), T37 (rewards)

## Goal
Auth + user database on the existing Next.js app. **No separate backend.** The app stays fully usable anonymous — login is only required for /account/* pages; the affiliate compare flow must not gain a single login wall.

## Pre-made decisions (binding)
- **Stack:** Supabase Auth (email + password, email confirmation ON) + Supabase Postgres. New deps allowed: `@supabase/supabase-js`, `@supabase/ssr` (cookie-based sessions). No other auth provider, no NextAuth.
- **Schema** (SQL migration file committed at `web/supabase/migrations/`):
  - `profiles`: `id uuid PK → auth.users(id) on delete cascade`, `first_name text NOT NULL`, `last_name text NOT NULL`, `birth_date date NOT NULL`, `country_code text NOT NULL` (ISO 3166-1 alpha-2), `email_notifications boolean NOT NULL DEFAULT false`, `terms_accepted_at timestamptz NOT NULL`, `terms_version text NOT NULL`, `referral_code text UNIQUE NOT NULL`, `referred_by uuid NULL → profiles(id)`, `providers_used text[] NULL` (opt-in signup extra), `heard_from text NULL` (`search | friend | social | youtube | other`), `created_at timestamptz DEFAULT now()`.
  - `affiliate_clicks`: `id uuid PK default gen_random_uuid()`, `user_id uuid NULL → profiles(id)`, `provider_id text NOT NULL`, `created_at`. (Populated in T37; table exists from day 1.)
  - `referral_rewards`: `id uuid PK`, `referrer_id uuid NOT NULL → profiles(id)`, `referred_id uuid NULL → profiles(id)`, `click_id uuid NULL → affiliate_clicks(id)`, `kind text` (`signup | conversion`), `provider_id text NULL`, `event_type text NULL` (`lead | sale`), `amount numeric NULL`, `currency text NULL`, `status text CHECK (pending | confirmed | rejected | redeemed)`, `external_ref text NULL`, `created_at`. Per-referred detail (which provider, what event) lives here — the referrer's UI only ever shows aggregates (see T37 privacy note).
- **RLS on, every table.** `profiles`: user selects/updates own row only; `referral_code`, `referred_by`, `terms_accepted_at` are NOT client-updatable (trigger rejects). `referral_rewards` + `affiliate_clicks`: user reads rows where they are referrer/owner; inserts server-only (service role).
- **Referral code:** generated server-side at profile creation — 8 chars, Crockford base32 alphabet (no `0 O 1 I`), uppercase, retry on collision. Satisfies referral.md's "uppercase 6–10 chars".
- **Service layer:** `web/lib/services/auth.ts` exposing `signUp(data)`, `signIn`, `signOut`, `getSession`, `getProfile`, `updateProfile` — components never import supabase clients directly (mirrors the PersistenceService wiring rule).
- **Middleware:** extend/create `web/middleware.ts` only for Supabase session refresh + redirect of unauthenticated `/account/*` → `/login`. No other route touched.
- **Anonymous fallback unchanged:** logged-out users keep today's localStorage persistence exactly as-is. (Server sync of alerts/favorites is a follow-up task, not this one.)

## Steps
1. Spec first: new `docs/services/auth.md` (contract above, ~1 page); `docs/services/persistence.md` future-note → "arriving via T34–T37"; MODULES.md services table + Referral/Profile rows → ◐ web; ROADMAP Phase 5 → note accounts slice pulled forward 2026-07-17; data-model.md `UserProfile` gains `firstName/lastName/birthDate/countryCode/emailNotifications/referralCode/referredBy` (splits `name`).
2. Migration SQL + apply to the Supabase project; commit the file.
3. `auth.ts` service + supabase client helpers (`web/lib/supabase/{client,server}.ts`) + middleware.
4. Vitest: referral-code generator (alphabet, length, collision retry) + auth service happy-path with mocked client.

## Verify
- `npm test && npm run build && npm run lint` green.
- Manual/Playwright: anonymous browsing of all 5 tabs untouched (no redirect, no layout shift); `/account` redirects to `/login`.
- Supabase dashboard: RLS enabled on the 3 tables; a test signup via SQL cannot update its own `referral_code`.

## Out of scope — do NOT
- No signup/login UI (T35). No OAuth providers. No migration of existing localStorage data. No iOS/Android work. No push/email sending.
