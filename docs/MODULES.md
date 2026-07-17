# Modules Index

Status table for every feature module across the three platforms.

Legend: ☐ not started · ◐ in-progress · ✅ shipped

Android column: Compose screens + ViewModels exist for every module (mock data) — ◐ means scaffolded on mocks, not wired to real services.

| Module | iOS | Web | Android | Spec |
|---|:-:|:-:|:-:|---|
| Home | ◐ | ✅ | ◐ | [home.md](modules/home.md) |
| Comparison | ◐ | ✅ | ◐ | [comparison.md](modules/comparison.md) |
| Provider Details | ◐ | ✅ | ◐ | [provider-details.md](modules/provider-details.md) |
| Analytics | ◐ | ✅ | ◐ | [analytics.md](modules/analytics.md) |
| Alerts | ◐ | ◐ | ◐ | [alerts.md](modules/alerts.md) |
| Promos | ☐ | ✅ | ☐ | [promos.md](modules/promos.md) |
| Profile | ◐ | ◐ | ◐ | [profile.md](modules/profile.md) |
| Settings | ◐ | ◐ | ◐ | [settings.md](modules/settings.md) |
| Premium | ◐ | ☐* | ◐ | [premium.md](modules/premium.md) |
| Referral | ◐ | ◐ | ◐ | [referral.md](modules/referral.md) |
| Onboarding | ◐ | ◐ | ◐ | [onboarding.md](modules/onboarding.md) |
| Landing | — | ✅ | — | [landing.md](modules/landing.md) |
| Brokers (high-amount) | ☐ | ✅ | ☐ | [brokers.md](modules/brokers.md) |
| Corridor pages (SEO) | — | ✅ | — | [corridors.md](modules/corridors.md) |

\* post-MVP (apps) — Premium is an app-phase module; the web tab bar ships Home/Compare/Analytics/Alerts/Promos + Onboarding (see [navigation](architecture/navigation.md)). Settings is routable for web (light, local-only version). Profile and Referral gain a web foundation via T34–T37 (accounts + referral rewards, pulled forward 2026-07-17) — routable at `/account` and `/account/referral`, not the tab bar.

## Services (cross-cutting)

| Service | Status | Spec |
|---|:-:|---|
| Exchange Rate API | ◐ (web real: quotes aggregator + history + health; iOS Frankfurter rate only, quotes mock) | [exchange-rate.md](services/exchange-rate.md) |
| Auth | ◐ (web: Supabase Auth + Postgres wired T34, signup/login/account UI T35; referral attribution — T36) | [auth.md](services/auth.md) |
| Referral rewards — click tracking, conversion ingestion, ledger | ◐ (web: sub-ID click tracking + manual conversion ingestion + rewards ledger wired T37; no live affiliate deal yet to verify end-to-end) | [referral.md](services/referral.md) |
| Persistence | ◐ (iOS SwiftData) | [persistence.md](services/persistence.md) |
| Notifications | ◐ (iOS local; push pending) | [notifications.md](services/notifications.md) |
| Subscriptions / IAP | ◐ (iOS StoreKit 2) | [subscriptions.md](services/subscriptions.md) |
| Analytics — event tracking (distinct from the Analytics *charts* module above) | ◐ (web wired: PostHog EU, consent-gated; iOS/Android console only) | [analytics.md](services/analytics.md) |

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
