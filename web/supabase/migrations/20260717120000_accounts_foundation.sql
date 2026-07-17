-- T34: accounts foundation — profiles, affiliate_clicks, referral_rewards.
-- docs/services/auth.md is the source of truth for this schema.
--
-- "Automatically expose new tables" is OFF on this project (deliberate —
-- controlled access via explicit RLS + explicit grants below), so every
-- table needs both an RLS policy AND a table-level GRANT, or PostgREST will
-- reject requests before RLS is even evaluated.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  birth_date date not null,
  country_code text not null,
  email_notifications boolean not null default false,
  terms_accepted_at timestamptz not null,
  terms_version text not null,
  referral_code text not null unique,
  referred_by uuid references public.profiles (id),
  providers_used text[],
  heard_from text check (heard_from in ('search', 'friend', 'social', 'youtube', 'other')),
  created_at timestamptz not null default now()
);

create index profiles_referred_by_idx on public.profiles (referred_by);

alter table public.profiles enable row level security;

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- profiles are inserted server-side only (service role, which bypasses RLS) —
-- no insert policy for authenticated/anon.

-- referral_code / referred_by / terms_accepted_at are not user-editable, even
-- though profiles_update_own otherwise lets a user update their own row.
create or replace function public.profiles_protect_immutable_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if new.referral_code is distinct from old.referral_code then
    raise exception 'referral_code is not user-editable';
  end if;
  if new.referred_by is distinct from old.referred_by then
    raise exception 'referred_by is not user-editable';
  end if;
  if new.terms_accepted_at is distinct from old.terms_accepted_at then
    raise exception 'terms_accepted_at is not user-editable';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_immutable_fields_trg
  before update on public.profiles
  for each row execute function public.profiles_protect_immutable_fields();

-- ---------------------------------------------------------------------
-- affiliate_clicks (populated by T37; table exists from day 1)
-- ---------------------------------------------------------------------

create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id),
  provider_id text not null,
  created_at timestamptz not null default now()
);

create index affiliate_clicks_user_id_idx on public.affiliate_clicks (user_id);
create index affiliate_clicks_provider_id_idx on public.affiliate_clicks (provider_id);

alter table public.affiliate_clicks enable row level security;

grant select on public.affiliate_clicks to authenticated;
grant all on public.affiliate_clicks to service_role;

create policy "affiliate_clicks_select_own"
  on public.affiliate_clicks for select
  to authenticated
  using (auth.uid() = user_id);

-- inserts are server-only (service role) — no insert policy.

-- ---------------------------------------------------------------------
-- referral_rewards
-- ---------------------------------------------------------------------

create table public.referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles (id),
  referred_id uuid references public.profiles (id),
  click_id uuid references public.affiliate_clicks (id),
  kind text not null check (kind in ('signup', 'conversion')),
  provider_id text,
  event_type text check (event_type in ('lead', 'sale')),
  amount numeric,
  currency text,
  status text not null check (status in ('pending', 'confirmed', 'rejected', 'redeemed')),
  external_ref text,
  created_at timestamptz not null default now()
);

create index referral_rewards_referrer_id_idx on public.referral_rewards (referrer_id);
create index referral_rewards_referred_id_idx on public.referral_rewards (referred_id);
create index referral_rewards_click_id_idx on public.referral_rewards (click_id);

alter table public.referral_rewards enable row level security;

grant select on public.referral_rewards to authenticated;
grant all on public.referral_rewards to service_role;

create policy "referral_rewards_select_own"
  on public.referral_rewards for select
  to authenticated
  using (auth.uid() = referrer_id or auth.uid() = referred_id);

-- inserts are server-only (service role) — no insert policy.
