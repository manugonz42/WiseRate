-- Delete-account FK behavior (T35, GDPR art. 17). The T34 migration created
-- these FKs with the default NO ACTION, which blocks deleting any account
-- that has referral or click history. Intended behavior per
-- docs/plan/T35-signup-ui.md:
--   - the referred user's personal detail nulls out (referred_by, clicks,
--     rewards.referred_id)
--   - the referrer's reward history is their own data and cascades away
--     with their account.

alter table public.profiles
  drop constraint profiles_referred_by_fkey,
  add constraint profiles_referred_by_fkey
    foreign key (referred_by) references public.profiles (id) on delete set null;

alter table public.affiliate_clicks
  drop constraint affiliate_clicks_user_id_fkey,
  add constraint affiliate_clicks_user_id_fkey
    foreign key (user_id) references public.profiles (id) on delete set null;

alter table public.referral_rewards
  drop constraint referral_rewards_referrer_id_fkey,
  add constraint referral_rewards_referrer_id_fkey
    foreign key (referrer_id) references public.profiles (id) on delete cascade,
  drop constraint referral_rewards_referred_id_fkey,
  add constraint referral_rewards_referred_id_fkey
    foreign key (referred_id) references public.profiles (id) on delete set null,
  drop constraint referral_rewards_click_id_fkey,
  add constraint referral_rewards_click_id_fkey
    foreign key (click_id) references public.affiliate_clicks (id) on delete set null;

-- The immutable-fields guard must not block the ON DELETE SET NULL fired on
-- a surviving referred user's row when their referrer deletes their account:
-- that update runs in the auth admin's context, where there is no request
-- JWT at all. Only authenticated client updates are constrained.
create or replace function public.profiles_protect_immutable_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or auth.role() = 'service_role' then
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
