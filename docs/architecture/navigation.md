# Navigation

Cross-platform route map. iOS is authoritative; other platforms mirror.

## Dependencies
- **Reads:** every [module](../modules/) (target screens), [data-model](data-model.md) (route param types)
- **Future:** ⏳ universal links / app links once domain is provisioned

## Used by
- All three [platforms](../platforms/) bind their router to this table.
- [notifications](../services/notifications.md) (deep links into Alerts and Provider Details)

## Tab bar (5 tabs)

| # | Tab | Icon | Module |
|---|---|---|---|
| 1 | Home | house | [home](../modules/home.md) |
| 2 | Compare | arrow.left.arrow.right | [comparison](../modules/comparison.md) |
| 3 | Analytics | chart.line.uptrend.xyaxis | [analytics](../modules/analytics.md) |
| 4 | Alerts | bell | [alerts](../modules/alerts.md) |
| 5 | Promos | tag | [promos](../modules/promos.md) |

**Web note:** the web tab bar ships all 5 tabs (Home, Compare, Analytics, Alerts, Promos). Settings is routable (not modal) at `/settings` with a gear icon entry next to the language selector in two spots: the top header and Home's desktop top nav — accessible but not a tab. Profile/Premium/Referral are app-phase modules, not part of the web MVP. On mobile widths the tabs render as a fixed bottom tab bar (app-like); from `sm` up every tab except Home uses the mobile shell at all widths: the sticky translucent top header carries the tab pills inline, plus (on `lg+`) the live pill, language selector and settings gear. Home is the only desktop exception: on `lg+` it keeps the split-hero shell from the Home redesign — ink hero aside + light panel with nav pills across the top, lime-scoped palette. The hero exposes a portal slot (`web/components/SidebarSlot.tsx`) that Home fills with amount chips / hero / CTA / savings ring (see [home](../modules/home.md)). Breakpoint-driven (CSS only), no server-side UA sniffing. The header's live pill (`nav.live`, "🇪🇺→🇵🇭 live") always reads "live" in English — excluded from translation, see [localization](localization.md).

## Routes (push)

| Route | Params | Module |
|---|---|---|
| `providerDetail` | `providerID: string` | [provider-details](../modules/provider-details.md) |
| `comparisonResult` | `result: ComparisonResult` | [comparison](../modules/comparison.md) |
| `analyticsTimeFrame` | `timeFrame: TimeFrame` | [analytics](../modules/analytics.md) |

## Modal sheets

| Sheet | Trigger | Module |
|---|---|---|
| Premium | upgrade CTA (Home, Profile) | [premium](../modules/premium.md) |
| Referral | Profile → "Invite friends" | [referral](../modules/referral.md) |
| Share | provider card → share button | system share |

## Onboarding gate

App boots into [onboarding](../modules/onboarding.md) if `UserProfile.hasCompletedOnboarding == false`. 4 pages: Welcome → Features → Currency → Notifications. Sets `preferredSendCurrency`, `preferredReceiveCurrency`, notification permission, then transitions to tab bar.

## Deep links

Scheme: `wiserate://`

| Path | Action |
|---|---|
| `wiserate://provider/<id>` | open Provider Details |
| `wiserate://alert/<id>` | open Alerts → highlight alert |
| `wiserate://compare?from=EUR&to=PHP&amount=500` | open Comparison with prefilled inputs |

## Per-platform mapping

- **iOS**: `WiseRate/Navigation/AppRouter.swift` — `Route` enum + `NavigationState` observable.
- **Web**: file-based routes under `app/` (Next.js App Router).
- **Android**: `NavHost` + sealed `Screen` class mirroring `Route` enum.

## Web onboarding (resolved)

Web shows a dismissable 3-step modal on first visit to any `(tabs)` route (not blocking): value prop + preferences + promos. Deep links never wall visitors off. Set via `localStorage["sulitsend.onboarded.v1"]`; reset button in Settings. See [onboarding](../modules/onboarding.md) Web section.
