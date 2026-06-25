# Module: Profile

**Status:** iOS ◐ · Web ◐ · Android ☐

## Dependencies
- **Reads:** [persistence](../services/persistence.md), [subscriptions](../services/subscriptions.md) (Premium badge), [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md)
- **Navigates to:** [settings](settings.md), [referral](referral.md), [premium](premium.md), [provider-details](provider-details.md) (favorites / recents)
- **Future:** ⏳ backend auth (email re-verification on edit)

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
- **iOS**: `SendRate/Features/Profile/ProfileView.swift`
- **Web**: `web/app/(tabs)/profile/page.tsx`
- **Android**: `android/.../features/profile/ProfileScreen.kt`

## Open questions
- Email editing requires auth re-verification — defer until accounts ship.
