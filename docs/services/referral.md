# Service: Referral rewards (T37)

Click tracking → conversion ingestion → rewards ledger. Web only, built on [auth](auth.md)'s accounts foundation (T34) and [referral attribution](../modules/referral.md) (T36).

## Dependencies
- **Reads:** [auth](auth.md) (`profiles`, `affiliate_clicks`, `referral_rewards` schema/RLS), `web/lib/data/providers.ts` (`affiliateURL`, `subIdParam`), `web/lib/brokers.ts` (`url`, `subIdParam`)
- **Used by:** [referral module](../modules/referral.md), `/account/referral` (T36 page, real aggregates)

## Outbound click tracking

Every affiliate/broker CTA (compare, home, provider detail, promos) goes through `POST /api/click` before navigating:
1. Client keeps the plain affiliate/website URL as the `<a href>` (no-JS fallback — works without credit) and calls `web/lib/services/affiliate-click.ts`'s `openAffiliateLink()` from `onClick`. The tab is opened synchronously inside the click gesture and pointed at the resolved URL once the route responds — Safari/iOS block a `window.open` issued after an `await`.
2. Route resolves the provider/broker id server-side only (`web/lib/services/click.ts`'s `resolveClickTarget()`) — never trusts a client-submitted URL, to avoid an open redirect.
3. Inserts an `affiliate_clicks` row (`user_id` = session user or `null` for anonymous; anonymous clicks are tracked for funnel data but can never produce a reward).
4. Appends the network's sub-ID param (`ProviderDetail.subIdParam` / `Broker.subIdParam`, e.g. `clickref` for Partnerize, `fobs` for FlexOffers — full table in `SolicitarAfiliados.md` § "Tracking por usuario") with the click id, and returns the redirect URL. Providers/brokers without a known param get the plain URL — no sub-id credit, but the click row still exists.

## Conversion ingestion (MVP = manual)

`POST /api/admin/conversions`, guarded by the `ADMIN_INGEST_TOKEN` bearer token (env var; unset = always 401). Body: `{ conversions: ConversionRow[] }` — one row per line of a network's CSV/JSON export (`clickId`, `providerId`, `eventType: "lead"|"sale"`, `amount?`, `currency?`, `status: "pending"|"confirmed"|"rejected"`, `externalRef`).

Resolution (`web/lib/services/conversion-ingestion.ts`'s `ingestConversion()` — pure, injected Supabase callbacks, same convention as `referral-attribution.ts`):
1. Unknown `clickId` → skipped, nothing written.
2. Known click → **always** records the conversion detail on the `affiliate_clicks` row itself (`event_type`, `amount`, `currency`, `conversion_status`, `external_ref`, `converted_at`) — this happens whether or not the click's user was referred; it's the "which provider did this user convert at" record. A write failure (e.g. the `external_ref` unique index firing on a different click) surfaces as that row's `error` outcome; the rest of the batch continues.
3. Anonymous click (no `user_id`) → no reward possible, stop here.
4. User has no `referred_by` → no reward possible, stop here.
5. Referred user: idempotent on `external_ref` — if a `referral_rewards` row already has this `external_ref`, only its `status` is refreshed (handles a network moving pending → confirmed/rejected on re-import), never a second row.
6. Otherwise: **one non-rejected reward per `referred_id`** — only a referred user's first conversion creates a `referral_rewards` row (`kind: conversion`); later conversions still update the click row (step 2) but earn nothing further. A reward whose status ends up `rejected` does **not** block a later approved conversion from earning (the reward is for the first *confirmed* conversion).
7. Network postback webhooks are a later upgrade against the same tables/function — same `ingestConversion()`, different route.

Both `affiliate_clicks.external_ref` and `referral_rewards.external_ref` carry a `unique where external_ref is not null` index (migration `20260717130000_referral_conversions.sql`) as a DB-level backstop.

## Reward model

**1 month of SulitSend Premium** per referred user whose first affiliate conversion is confirmed. No cash, no CPA %. Months accrue in the ledger (`status: pending`/`confirmed`); redemption (`status: redeemed`) waits for web Premium to ship (Phase 5) — until then `/account/referral` copy says months accumulate and activate at launch.

## Privacy (binding)

The referrer's UI (`/account/referral`, `GET /api/referral/stats`) shows **only aggregates**: invited count, converted count, months pending/confirmed. Never which provider or amount a specific referred person used — that detail is the referred user's data and stays server-side/admin-only (`affiliate_clicks`/`referral_rewards` rows, service-role reads only).

## Anti-fraud v1

Self-referral is impossible (T36 guard on `resolveReferral()`). One reward per `external_ref` (idempotency) and one reward per `referred_id` (first-conversion-only) are both enforced in `ingestConversion()`. Rewards only ever reflect the network's own approved/confirmed status — never invented locally. Device fingerprinting is deferred (open question, [referral module](../modules/referral.md)).

## Out of scope (this task)

No payout/redemption execution, no money movement, no network postback webhook endpoints yet, no fingerprinting, no reward emails.
