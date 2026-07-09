# Module: Onboarding

**Status:** iOS ◐ · Web ☐ (missing) · Android ☐

## Dependencies
- **Reads:** [notifications](../services/notifications.md) (permission request on page 4), [persistence](../services/persistence.md) (writes selected currencies + flag), [localization](../architecture/localization.md), [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md)
- **Navigates to:** [home](home.md) (tab bar) on complete
- **Future:** ⏳ backend auth (optional account creation step before tab bar)

## Used by
- App boot — gates entry to the tab bar while `UserProfile.hasCompletedOnboarding = false`

## Purpose
**iOS/Android:** 4-step intro that personalizes the app: welcome → features → currency pair → notification permission.
**Web:** lightweight 3-step dismissable modal (not a blocking gate): value prop → preferences (language + default amount) → promos explanation (with provider selection). Deep-linked visitors never see a wall.

## Inputs (data dependencies)
- `OnboardingViewModel.currentPage`, `.selectedSendCurrency`, `.selectedReceiveCurrency`, `.notificationsRequested`
- `NotificationService.requestPermission()` — see [notifications](../services/notifications.md)
- `PersistenceService.profile.update(...)` to write the chosen currencies + onboarding flag

## Outputs / Actions
- Next → advance page (analytics: `onboarding.page_viewed`)
- Back → previous page (page 1 has no back)
- Page 4 "Allow notifications" → request permission, then complete
- "Skip" on notifications → complete without permission
- Complete → `UserProfile.hasCompletedOnboarding = true`, route to tab bar (`onboarding.completed`)

## Acceptance criteria
- 4 pages exactly, with a page indicator (dots)
- Page 1 (Welcome): hero + tagline + primary button
- Page 2 (Features): 3–4 feature bullets with icons
- Page 3 (Currency): from/to pickers, default EUR / PHP
- Page 4 (Notifications): explainer + Allow / Skip
- Pressing back never crashes
- Completing persists currencies + flag atomically — re-entering the app skips onboarding
- No analytics fired before consent (analytics consent is part of page 4)

## Platform notes
- **iOS**: `WiseRate/Features/Onboarding/OnboardingView.swift` — currently auto-completes in `WiseRateApp.swift`; that line must be removed when this module ships. 4-step flow, blocking gate.
- **Web**: `web/components/Onboarding.tsx` (modal, client-effect only, dismissed via `localStorage["sulitsend.onboarded.v1"]`). Mounted from `(tabs)/layout.tsx`. 3 steps: value prop (with monetization link) → preferences (language + default amount, reused from Settings) → promos (ProviderAccounts for first-transfer opt-in). Reset via Settings "Replay intro" button. See [navigation](../architecture/navigation.md) "Web gap" (resolved).
- **Android**: `android/.../features/onboarding/OnboardingScreen.kt`

## Open questions
- Add an account-creation step before tab bar (magic link), or keep accounts optional and gated by Premium?
