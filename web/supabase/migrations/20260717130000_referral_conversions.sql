-- T37: conversion ingestion.
-- docs/services/referral.md is the source of truth for this contract.
--
-- affiliate_clicks gains the network's own conversion detail so "which
-- provider did this click convert at" is recorded for every converting
-- click, referred or not (docs/plan/T37-referral-rewards.md's "always
-- record" rule) — a reward row in referral_rewards only follows when the
-- clicking user has a referrer.

alter table public.affiliate_clicks
  add column event_type text check (event_type in ('lead', 'sale')),
  add column amount numeric,
  add column currency text,
  add column conversion_status text check (conversion_status in ('pending', 'confirmed', 'rejected')),
  add column external_ref text,
  add column converted_at timestamptz;

-- Idempotency guard: the same network conversion record (external_ref)
-- must never be recorded twice, on either table.
create unique index affiliate_clicks_external_ref_idx
  on public.affiliate_clicks (external_ref)
  where external_ref is not null;

create unique index referral_rewards_external_ref_idx
  on public.referral_rewards (external_ref)
  where external_ref is not null;
