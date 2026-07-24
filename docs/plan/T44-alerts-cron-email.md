# T44 — Cron evaluation + email delivery (Resend, `alerts@sulitsend.com`)

## Dependencies
- **Reads:** [notifications service](../services/notifications.md), [exchange-rate](../services/exchange-rate.md) (Frankfurter mid-market, same source as `/api/history`), T42 (`alerts` table), [ROADMAP](../ROADMAP.md) Phase 3
- **Task deps:** T42 (rows to evaluate), T43 (rows are being created)
- **Human prerequisite (blocking send):** Resend account + `sulitsend.com` domain verified (DKIM/SPF in Cloudflare) + `RESEND_API_KEY` in env. Step-by-step in the plan README human checklist. Until done, the cron still runs and marks `triggered_at`, but sending is a no-op/log (guard on missing key) — **decide at build time:** do NOT mark `triggered_at` if the email fails to send, so a real trigger isn't silently lost before the domain is live.

## Used by
- End users (receive the alert email); closes [alerts.md](../modules/alerts.md) "evaluation Phase 3".

## Goal
A daily server job reads enabled, not-yet-triggered alerts, checks them against the fresh EUR→PHP mid-market rate, and emails the owner from `alerts@sulitsend.com` when one crosses. One-shot per alert.

## Pre-made decisions (binding)
- **Cadence: daily, after the ECB fix.** `web/vercel.json` cron `{"path": "/api/cron/alerts", "schedule": "0 16 * * *"}` (16:00 UTC is after the ~16:00 CET / 18:00 CEST Frankfurter fix year-round). **Hobby allows one daily cron** — no Vercel Pro dependency for v1. Hourly/intraday is a later upgrade (needs Pro; only useful once `providerCheapest`/intraday sources exist).
- **Auth:** guard `/api/cron/alerts` — reject unless the request carries the Vercel Cron `Authorization: Bearer ${CRON_SECRET}` header (Vercel injects it). Manual/unauthorized hits → 401.
- **Evaluation:** fetch mid EUR→PHP once (reuse the Frankfurter path behind `/api/history`/`getRate`); `select` enabled + `triggered_at is null` alerts via **service-role** (`web/lib/supabase/server.ts` service client). Fire when `rateAbove && rate ≥ target` or `rateBelow && rate ≤ target`. Resolve recipient email from `auth.users` by `user_id` (service-role, `auth.admin.getUserById` or a joined view) — **never** trust a client-supplied address.
- **Email:** new `web/lib/services/email.ts` wrapping **Resend** (`RESEND_API_KEY`). From `alerts@sulitsend.com` (`ALERTS_FROM` env, defaulted). **Template is a functional placeholder for now** — subject e.g. *"€1 is now above ₱XX.XX"*, body = current rate + the target + a CTA button to `https://app.sulitsend.com/alerts`. Deep link is the **web URL**, not `wiserate://`. Final visual design is a separate task ("luego diseñamos el email"). Localize subject/body by the owner's profile locale if available, else `en`.
- **One-shot + idempotency:** set `triggered_at = now()` only **after** a successful send (see human prereq note). A row already `triggered_at` is never re-sent. No repeat/re-arm in v1 (alerts.md open question — Premium "repeat" is later).
- **Batching/limits:** send sequentially or in small batches; Resend free tier 3k/mo is ample at current volume. Log per-alert outcome for debugging; a failed send logs + leaves the row pending for the next run.
- New env vars documented in `DEPLOY.md`: `RESEND_API_KEY`, `ALERTS_FROM`, `CRON_SECRET`.

## Steps
1. Spec first: `notifications.md` — web local/email delivery section (cron + Resend, daily, one-shot); `exchange-rate.md` unchanged (reuses existing rate path); `DEPLOY.md` new env + cron note; ROADMAP Phase 3 "Web alert delivery" → in progress/done.
2. `email.ts` (Resend wrapper) + placeholder template.
3. `/api/cron/alerts/route.ts` (CRON_SECRET guard, rate fetch, service-role query, evaluate, send, mark) + `vercel.json` cron entry.
4. Vitest: evaluation predicate (above/below boundary cases), recipient resolution mocked, "no send → no triggered_at" guard, already-triggered skipped.

## Verify
- Local: call `/api/cron/alerts` with the bearer secret against a seeded alert whose target is already crossed → email sent (Resend test/live), row flips `triggered_at`; call again → skipped. Wrong/no secret → 401.
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No `providerCheapest`, no push (APNs/FCM/Web Push), no intraday/hourly cron, no final email visual design, no repeat/re-arm, no in-app "triggered" realtime (the page shows triggered on next load). Do not move alert storage to Redis (T42 = Supabase).
