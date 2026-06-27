# Module: Settings

**Status:** iOS ◐ · Web ◐ · Android ◐

## Dependencies
- **Reads:** [persistence](../services/persistence.md), [notifications](../services/notifications.md), [subscriptions](../services/subscriptions.md) (manage subscription action), [localization](../architecture/localization.md), [design-system](../architecture/design-system.md)
- **Navigates to:** platform-native subscription management, external Privacy/Terms URLs
- **Future:** ⏳ backend (delete account, sign-out endpoint)

## Used by
- [profile](profile.md) — sheet trigger

## Purpose
App preferences: notifications, theme, language, default amount, data privacy, account actions.

## Inputs (data dependencies)
- `SettingsViewModel.notificationsEnabled`, `.darkModeEnabled`, `.defaultAmount`, `.language`
- `PersistenceService.settings.get / .set` — see [persistence](../services/persistence.md)
- `NotificationService.permissionStatus` — see [notifications](../services/notifications.md)

## Outputs / Actions
- Toggle notifications → re-request OS permission if needed (analytics: `settings.changed`)
- Change language → applies i18next/String-Catalog/strings.xml locale switch
- Change default amount → used by Home + Comparison initial state
- Tap "Clear cache" → confirm + drop `CachedQuote` / `CachedHistorical`
- Tap "Manage subscription" → platform-native subscription management
- Tap "Privacy" / "Terms" → in-app web view to legal pages
- Tap "Sign out" / "Delete account" (once accounts exist) → confirm + execute

## Acceptance criteria
- All toggles reflect current persisted state on open
- Language selector lists en / es / tl — see [localization](../architecture/localization.md)
- Dark mode toggle is a no-op for now (we're dark-only) but persisted for future
- "Clear cache" shows a confirmation, then a success toast with reclaimed size
- Manage subscription opens the platform's native flow (`SKShowManageSubscriptions` on iOS, billing center on Android)

## Platform notes
- **iOS**: `WiseRate/Features/Settings/SettingsView.swift`
- **Web**: `web/app/(tabs)/profile/settings/page.tsx` (modal route)
- **Android**: `android/.../features/settings/SettingsScreen.kt`

## Open questions
- Should "Default delivery method" live here or in Profile? Currently in Profile.
