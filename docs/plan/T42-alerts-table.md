# T42 — `alerts` table + storage service (Supabase)

## Dependencies
- **Reads:** [auth service](../services/auth.md) (RLS + grants conventions, service-role), [alerts module](../modules/alerts.md), [data-model](../architecture/data-model.md) (`RateAlert`), T34 schema/migrations
- **Task deps:** T34 (Supabase wired), T41 (gate — alerts are account-only)

## Used by
- T43 (Alerts UI reads/writes through this service), T44 (cron reads via service-role)

## Goal
Persist rate alerts server-side in the existing EU Postgres, one row per alert, owned by a logged-in user. No anonymous alerts (removed 2026-07-24).

## Pre-made decisions (binding)
- **Migration** `web/supabase/migrations/2026072X…_alerts.sql` (follow T34 conventions exactly — explicit RLS **and** table-level GRANT, or PostgREST rejects before RLS):
  ```sql
  create table public.alerts (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references public.profiles(id) on delete cascade,
    from_currency text not null default 'EUR',
    to_currency   text not null default 'PHP',
    notify_type   text not null check (notify_type in ('rateAbove','rateBelow')),
    target_rate   numeric not null check (target_rate > 0),
    is_enabled    boolean not null default true,
    triggered_at  timestamptz,            -- one-shot: set when it fires
    created_at    timestamptz not null default now()
  );
  create index alerts_user_id_idx on public.alerts (user_id);
  create index alerts_pending_idx on public.alerts (is_enabled) where triggered_at is null;
  ```
- **No `email` column.** Delivery address is always the account email — the cron resolves it from `auth.users` by `user_id` (T44). Storing it on the row would let a client spoof the recipient.
- **RLS: user does full CRUD on own rows** (unlike `profiles`, which was server-only). Policies for `authenticated`: select/insert/update/delete `using (auth.uid() = user_id)` (+ `with check` on insert/update). `grant select, insert, update, delete on public.alerts to authenticated; grant all to service_role;`. This lets the client write directly with its session (idiomatic Supabase, same as `profiles_update_own`) — no CRUD route handler needed.
- **`providerCheapest` is NOT in v1** (deferred to a later task): the `notify_type` check omits it. v1 evaluates only mid-market crossings (cheap, one datum/day). Revisit when a per-corridor quote evaluation exists.
- **Free cap = 3 enabled alerts**, enforced in the service layer + UI (T43), same as today. A DB trigger is optional/deferred — app-layer is enough for v1 (matches the referral-logic precedent).
- Service `web/lib/services/alerts.ts`: `listAlerts()`, `createAlert(input)`, `setEnabled(id, on)`, `deleteAlert(id)` — all through the auth'd Supabase client (`web/lib/supabase/client.ts`); components never import the Supabase client directly (persistence.md rule). Types reuse/extend `RateAlert` in `web/lib/models/types.ts` (drop the `providerCheapest` arm for web, or keep the type and reject it at the service boundary — pick the smaller diff).

## Steps
1. Spec first: `auth.md` entities table gains `alerts`; `alerts.md` "Web" note → Supabase-backed (evaluation still Phase 3/T44); data-model note if `RateAlert` shape changes.
2. Migration file + apply to the live project (Management API, as with T34 migrations — human step recorded in the checklist).
3. `alerts.ts` service + cap helper.
4. Vitest where feasible (cap logic, input validation); RLS isolation is verified e2e in the human checklist (as T34 was).

## Verify
- `npm test && npm run build && npm run lint` green.
- e2e (human checklist, service-role + two users): user A cannot select/update/delete B's alerts (RLS); cap rejects a 4th enabled alert.

## Out of scope — do NOT
- No UI changes (T43), no cron/email (T44), no `providerCheapest`, no anonymous path, no new npm deps. Do not add server sync of favorites (separate follow-up).
