# Module: Profile

**Status:** iOS ◐ · Web ◐ · Android ☐

## Dependencies
- **Reads:** [persistence](../services/persistence.md), [subscriptions](../services/subscriptions.md) (Premium badge), [auth](../services/auth.md) (web accounts, T34/T35), [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md)
- **Navigates to:** [settings](settings.md), [referral](referral.md), [premium](premium.md), [provider-details](provider-details.md) (favorites / recents)
- **Future:** ⏳ backend auth on iOS/Android (email re-verification on edit)

## Used by
- [navigation](../architecture/navigation.md) — tab 5

## Purpose
View and edit user info, see favorite + recent providers, jump to Settings / Referral / Premium.

## Inputs (data dependencies)
- `ProfileViewModel.user: UserProfile`, `.isEditMode`
- `PersistenceService.profile.get / .update` — see [persistence](../services/persistence.md)
- `SubscriptionService.entitlement` for Premium badge

## Outputs / Actions
- Toggle edit mode → reveal editable fields
- Save → `PersistenceService.profile.update(...)` (analytics: `profile.updated`)
- Tap favorite provider → `providerDetail(id)`
- Tap "Settings" → open Settings sheet
- Tap "Invite friends" → open Referral sheet
- Tap "Upgrade" (when free) → open Premium sheet

## Acceptance criteria
- User header: avatar (or initials), name, email, Premium badge when entitled
- Editable fields: name, preferred send currency, preferred receive currency, default delivery method
- Favorites section: horizontal scroll of saved providers (empty state OK)
- Recent providers section: chronological, capped at 10
- Save disabled until at least one field changed
- Cancel reverts unsaved edits

## Platform notes
- **iOS**: `WiseRate/Features/Profile/ProfileView.swift`
- **Web**: mock local-only `web/app/(tabs)/profile/page.tsx` is superseded by the real-accounts pages below (T35); no tab-bar entry — see [navigation](../architecture/navigation.md)
- **Android**: `android/.../features/profile/ProfileScreen.kt`

## Web accounts (T34/T35)

Real Supabase-backed accounts, web only. Anonymous browsing is unaffected — see [auth](../services/auth.md) for the "no login wall" rule.

- **Routes:** `/signup`, `/login`, `/reset-password`, `/account`. Not tabs — a person-circle header icon (avatar initials once logged in, `components/AccountButton.tsx`) is the entry point, same two header spots as `SettingsButton`.
- **Signup fields:** nombre + apellidos, email + password (Supabase, email confirmation required), fecha de nacimiento (typeable `DD/MM/YYYY` + calendar popover, age ≥ 18 client+server), país de residencia (searchable combobox, `web/lib/data/countries.ts`), email-notifications checkbox (default off), terms checkbox (required, stores `terms_accepted_at` + `terms_version`). Optional collapsed section: providers already used (shares the `ProviderAccounts` component/localStorage with T28 Settings), "how did you hear about us" (preselects `friend` when `?ref=` is present).
- **`/account`:** view/edit (first/last name, country, email-notification pref, providers used, heard-from) + logout + delete account. Email and birth date are read-only (no re-verification flow yet — open question below still applies). Delete calls `POST /api/account/delete` (service role `auth.admin.deleteUser`), which cascades the `profiles` row (GDPR art. 17); `referral_rewards.referred_id` nulls via FK, `referrer_id` keeps its history.
- **`/reset-password`:** dual-purpose — request-link form for anonymous visitors, new-password form once the emailed link lands with a Supabase recovery session.
- No referral code UI yet (T36). No OAuth. No avatar upload.

## Open questions
- Email/birth-date editing requires auth re-verification — defer until there's a concrete need.
