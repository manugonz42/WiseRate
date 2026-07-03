# Module: Alerts

**Status:** iOS ◐ · Web ◐ (UI + local CRUD; evaluation Phase 3) · Android ◐ (scaffold, frozen)

> **Planning note:** local-only alerts are demo-grade — web can't fire with the tab closed, and iOS background polling (BGTaskScheduler) is best-effort by design. Real alerts = backend cron + push, [ROADMAP](../ROADMAP.md) Phase 3. Build the UI/CRUD; don't invest further in client-side alert *evaluation*.

## Dependencies
- **Reads:** [persistence](../services/persistence.md), [notifications](../services/notifications.md), [exchange-rate](../services/exchange-rate.md), [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md)
- **Navigates to:** [provider-details](provider-details.md) (when `notifyType = providerCheapest`), [comparison](comparison.md), [premium](premium.md) (3-alert cap upsell)
- **Future:** ⏳ [subscriptions](../services/subscriptions.md) (free cap 3 → unlimited)

## Used by
- [navigation](../architecture/navigation.md) — tab 4
- [analytics](analytics.md) "Set alert at this rate" deep link
- [notifications](../services/notifications.md) deep link `wiserate://alert/<id>`

## Purpose
Create and manage rate alerts that notify the user when EUR→PHP crosses a target.

## Inputs (data dependencies)
- `AlertsViewModel.alerts`, `.newAlertRate`, `.newAlertType`
- `PersistenceService.alerts.list / .upsert / .delete` — see [persistence](../services/persistence.md)
- `NotificationService.schedule / .cancel` — see [notifications](../services/notifications.md)
- `ExchangeRateService.getRate()` for "current rate" reference

## Outputs / Actions
- Create alert → persist + schedule local notification
- Toggle alert → enable/disable scheduling
- Delete alert (swipe / long-press) → cancel + remove from store
- Tap triggered alert → deep-link to its provider (if `providerCheapest` type) or Comparison

## Acceptance criteria
- Active alerts and triggered alerts shown in two sections
- Create form: target rate input, type selector (rate above / rate below / provider is cheapest), provider picker when type is `providerCheapest`
- Free users capped at 3 active alerts; UI shows Premium upsell at limit
- Disabled alerts show greyed-out with a toggle
- Triggered alerts show fired-at timestamp (relative)
- Validation: target rate must be > 0 and within ±50% of current

## Platform notes
- **iOS**: `WiseRate/Features/Alerts/AlertsView.swift`
- **Web**: `web/app/(tabs)/alerts/page.tsx`
- **Android**: `android/.../features/alerts/AlertsScreen.kt`

## Open questions
- When an alert fires, does it auto-disable (one-shot) or keep firing until disabled? v1 default: **one-shot**, with a "repeat" toggle for Premium.
