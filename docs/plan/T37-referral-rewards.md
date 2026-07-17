# T37 — Referral rewards: click tracking, conversion ingestion, rewards ledger

## Dependencies
- **Reads:** [referral module](../modules/referral.md), `web/lib/data/providers.ts` (affiliate URLs), T34 schema (`affiliate_clicks`, `referral_rewards`)
- **Task deps:** T34–T36
- **Human prerequisite (blocking):** at least one affiliate network live **and confirmed to support sub-ID/clickref tracking**. Per-network capability table + fallbacks for networks without sub-ID: `SolicitarAfiliados.md` § "Tracking por usuario (sub-ID)". Verify the exact param on each approval and fill `subIdParam` in `providers.ts`.
- **Reward model (decided 2026-07-17): Premium months.** 1 month of SulitSend Premium per referred user whose **first** affiliate conversion is confirmed (one reward per `referred_id`, `kind: conversion`). Months accrue in the ledger (`status: confirmed`); redemption flips to `redeemed` when web Premium ships (Phase 5) — until then the UI copy says months accumulate and activate at Premium launch. No cash, no CPA %.

## Used by
- `/account/referral` stats (T36 page fills with real numbers)

## Goal
When a **referred** user's affiliate click converts (we earn a CPA), record it and credit the **referrer** in `referral_rewards`. Attribution chain: referrer → referred signup (T36) → referred user's click (this task) → network conversion report (this task).

## Pre-made decisions (binding)
- **Outbound click tracking:** affiliate CTAs go through `POST /api/click` → inserts `affiliate_clicks` row (`user_id` = session user or null, `provider_id`) → returns click `id` → redirect to the affiliate URL with the network's sub-ID param appended (`clickref=<click_id>` for Partnerize; per-network param name lives in a new `subIdParam` field on the provider entry in `providers.ts`). Providers without sub-ID support: track the click row, append nothing. Anonymous clicks are tracked too (funnel data) but can never produce rewards.
- **Conversion ingestion (MVP = manual):** admin-only route `POST /api/admin/conversions` guarded by `ADMIN_INGEST_TOKEN` env var — accepts the network CSV/JSON export (click sub-ID, provider, event type, commission amount, currency, status, external ref). For each row: resolve click → user → always record which provider the user converted at (`provider_id`, `event_type`) → if `referred_by` set → upsert `referral_rewards` (`kind: conversion`, `status` follows the network's own status, idempotent on `external_ref`). Network postback webhooks are a later upgrade, same table.
- **What gets stored per referred user** (decided 2026-07-17): signed up with us (their `profiles` row via `referred_by`), which providers they converted at through our links (`provider_id` + `event_type` on reward/click rows), commission generated (`amount`). **Privacy (binding):** the referrer's UI shows only aggregates (invited count, converted count, months earned) — never which provider or amount a specific referred person used; that detail is the referred user's personal data and stays server-side/admin-only.
- **Anti-fraud v1 (binding):** self-referral impossible (T36 guard); one reward per `external_ref` (idempotency); rewards only from conversions the network marks approved; per-referrer count of distinct `referred_id` shown, not raw click counts. Device fingerprinting deferred (referral.md open question — revisit with volume).
- **Referrer-facing display:** T36 stats card now shows real aggregates — invited, converted, **meses de Premium ganados** (pending + confirmed split). No redemption flow built (Premium doesn't exist on web yet); copy explains months activate at Premium launch.
- Never persist affiliate URLs client-side (persistence.md rule stands); the click route always reads them fresh from `providers.ts`.

## Steps
1. Spec first: `docs/services/auth.md` or new `docs/services/referral.md` gains the click/conversion contract; referral.md acceptance criteria updated (earnings = ledger, redemption TBD); MODULES.md note.
2. `subIdParam` per provider + `/api/click` + CTA wiring (compare, provider detail, promos — every affiliate CTA goes through it).
3. Ingestion route + idempotent ledger writes.
4. Vitest: click→reward resolution incl. anonymous click (no reward), non-referred user (no reward), duplicate `external_ref` (single row), rejected conversion (status follows).

## Verify
- Playwright + curl: click a CTA logged-in as referred user B → `affiliate_clicks` row with B; POST a fake conversion with that click id → reward row for referrer A, visible on A's `/account/referral`; repeat POST → still one row. Anonymous click converts → no reward.
- `npm test && npm run build && npm run lint` green; affiliate redirect latency < 300 ms added.

## Out of scope — do NOT
- No payout/redemption execution, no money movement, no webhook endpoints yet, no fingerprinting, no reward emails. Do not modify quote ranking or CTA visual design.
