# Modules Index

Status table for every feature module across the three platforms.

Legend: ☐ not started · ◐ in-progress · ✅ shipped

Android column: ◐ = scaffolded (stub `Screen.kt` + `ViewModel.kt` rendering placeholders that match the spec's acceptance criteria; reads mock data via service interfaces). Real UI follows iOS sequencing.

Web column: the Next.js port lives under `web/` — a **full-web responsive** app (top nav on desktop, not a phone-width mobile clone; see [web platform](platforms/web.md)). **Home is ported** (real components on mock services); remaining ◐ modules are still served only by the frozen `index.html` prototype, **redesigned** to responsive full-web layouts one-per-PR in table order (each module gets its desktop layout notes at port time).

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

## Services (cross-cutting)

| Service | Status | Spec |
|---|:-:|---|
| Exchange Rate API | ◐ (real Frankfurter; quotes still mock via pending proxy) | [exchange-rate.md](services/exchange-rate.md) |
| Quotes Server | ☐ (specced; separate backend) | [quotes-server.md](services/quotes-server.md) |
| Provider Adapters | ☐ (specced; per-provider extraction) | [provider-adapters.md](services/provider-adapters.md) |
| Persistence | ◐ (iOS SwiftData) | [persistence.md](services/persistence.md) |
| Notifications | ◐ (iOS local; push pending) | [notifications.md](services/notifications.md) |
| Subscriptions / IAP | ◐ (iOS StoreKit 2) | [subscriptions.md](services/subscriptions.md) |
| Analytics | ☐ (console only) | [analytics.md](services/analytics.md) |

## Web landing + SEO

The public landing (`web/app/page.tsx`) and web SEO (metadata, `sitemap.ts`, `robots.ts`, JSON-LD, OG image, hreflang) are ◐ in progress — the final web migration step. App surfaces under `(tabs)` are `noindex`. See [seo.md](architecture/seo.md) and [web platform](platforms/web.md).

## Architecture

- [Overview](architecture/overview.md) — 3-platform topology
- [Data model](architecture/data-model.md) — canonical entities
- [Navigation](architecture/navigation.md) — routes, tabs, deep links
- [Design system](architecture/design-system.md) — tokens
- [Localization](architecture/localization.md) — en / es / tl
- [SEO / ASO](architecture/seo.md) — web discoverability + app store optimization

## Reference

- [Providers EUR→PHP](reference/providers-eur-php.md) — legal/reliable provider universe + bank referral list for the Spain → Philippines corridor

## Platforms

- [iOS](platforms/ios.md)
- [Web](platforms/web.md)
- [Android](platforms/android.md)
