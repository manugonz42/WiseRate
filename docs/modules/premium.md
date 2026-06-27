# Module: Premium

**Status:** iOS ◐ · Web ◐ · Android ◐

## Dependencies
- **Reads:** [subscriptions](../services/subscriptions.md), [localization](../architecture/localization.md) (currency formatting), [design-system](../architecture/design-system.md)
- **Navigates to:** dismiss (returns to source screen)
- **Future:** —

## Used by
- [home](home.md) — upgrade CTA
- [analytics](analytics.md) — gates ≥3M historical
- [alerts](alerts.md) — 3-alert cap upsell
- [provider-details](provider-details.md) — gates >30D historical
- [settings](settings.md) — manage / upgrade
- [profile](profile.md) — upgrade button

## Purpose
Upsell screen: pitch Premium, present the two plans, run the purchase flow, confirm entitlement.

## Inputs (data dependencies)
- `PremiumViewModel.subscriptionStatus`, `.selectedPlan`, `.products`
- `SubscriptionService.products() / .purchase(productID) / .restore()` — see [subscriptions](../services/subscriptions.md)
- Source param (where the user came from) — for analytics: `home`, `alerts_limit`, `analytics_gate`, `settings`

## Outputs / Actions
- Tap plan card → select (`premium.plan_selected`)
- Tap "Subscribe" → `SubscriptionService.purchase(...)` (`premium.purchase_started` → `_succeeded` | `_failed`)
- Tap "Restore purchases" → `SubscriptionService.restore()`
- On success → dismiss + show celebratory toast + entitlement reflected app-wide

## Acceptance criteria
- Hero with gradient (primary → primary-light) + tagline
- Feature list with checkmarks (unlimited alerts, full history, ad-free, faster refresh)
- Two plan cards (monthly / yearly) — yearly default-selected, "Save 33%" badge
- Localized prices via the store SDK — never hardcoded
- Disabled subscribe button while purchase in-flight, with spinner
- Error messages map provider failure codes to friendly copy (user cancel ≠ error)
- "Restore purchases" link below CTA
- Terms + Privacy links visible per store requirements

## Platform notes
- **iOS**: `WiseRate/Features/Premium/PremiumView.swift`
- **Web**: `web/app/(tabs)/profile/premium/page.tsx` — Stripe Checkout redirect
- **Android**: `android/.../features/premium/PremiumScreen.kt`

## Open questions
- Free trial period? (Apple favors 7-day on monthly; revisit after first cohort.)
- Family Sharing on iOS — opt in?
