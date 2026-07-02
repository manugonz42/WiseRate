# Modules Index

Status table for every feature module across the three platforms.

Legend: ☐ not started · ◐ in-progress · ✅ shipped

Android column: Compose screens + ViewModels exist for every module (mock data) — ◐ means scaffolded on mocks, not wired to real services.

| Module | iOS | Web | Android | Spec |
|---|:-:|:-:|:-:|---|
| Home | ◐ | ◐ | ◐ | [home.md](modules/home.md) |
| Comparison | ◐ | ◐ | ◐ | [comparison.md](modules/comparison.md) |
| Provider Details | ◐ | ◐ | ◐ | [provider-details.md](modules/provider-details.md) |
| Analytics | ◐ | ◐ | ◐ | [analytics.md](modules/analytics.md) |
| Alerts | ◐ | ◐ | ◐ | [alerts.md](modules/alerts.md) |
| Profile | ◐ | ◐ | ◐ | [profile.md](modules/profile.md) |
| Settings | ◐ | ◐ | ◐ | [settings.md](modules/settings.md) |
| Premium | ◐ | ◐ | ◐ | [premium.md](modules/premium.md) |
| Referral | ◐ | ◐ | ◐ | [referral.md](modules/referral.md) |
| Onboarding | ◐ | ☐ | ◐ | [onboarding.md](modules/onboarding.md) |
| Landing | — | ◐ | — | [landing.md](modules/landing.md) |

## Services (cross-cutting)

| Service | Status | Spec |
|---|:-:|---|
| Exchange Rate API | ◐ (real Frankfurter; quotes still mock via pending proxy) | [exchange-rate.md](services/exchange-rate.md) |
| Persistence | ◐ (iOS SwiftData) | [persistence.md](services/persistence.md) |
| Notifications | ◐ (iOS local; push pending) | [notifications.md](services/notifications.md) |
| Subscriptions / IAP | ◐ (iOS StoreKit 2) | [subscriptions.md](services/subscriptions.md) |
| Analytics — event tracking (distinct from the Analytics *charts* module above) | ☐ (console only) | [analytics.md](services/analytics.md) |

## Architecture

- [Overview](architecture/overview.md) — 3-platform topology
- [Data model](architecture/data-model.md) — canonical entities
- [Navigation](architecture/navigation.md) — routes, tabs, deep links
- [Design system](architecture/design-system.md) — tokens
- [Localization](architecture/localization.md) — en / es / tl

## Platforms

- [iOS](platforms/ios.md)
- [Web](platforms/web.md)
- [Android](platforms/android.md)
