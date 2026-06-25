# Service: Notifications

Two surfaces: **local** (rate alerts that fire on-device) and **push** (sponsored offers, big rate moves, system messages).

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md) (`RateAlert`), [exchange-rate](exchange-rate.md) (current rate for trigger check)
- **Navigates to (deep links):** [alerts](../modules/alerts.md), [provider-details](../modules/provider-details.md) — see [navigation](../architecture/navigation.md)
- **Future:** ⏳ backend push delivery (APNs / FCM / Web Push)

## Used by
- [alerts](../modules/alerts.md) (schedule / cancel)
- [onboarding](../modules/onboarding.md) (page 4 permission request)
- [settings](../modules/settings.md) (re-prompt path)

## Local notifications (rate alerts)

Trigger: device-side check against the latest cached rate every time the app foregrounds, plus a background fetch where the OS allows it.

```
schedule(alert: RateAlert)        # registers OS-level notification
cancel(alertID)                   # removes it
checkAndFireDueAlerts()           # called on launch / foreground
```

Fires when:
- `notifyType = rateAbove` and current ≥ target
- `notifyType = rateBelow` and current ≤ target
- `notifyType = providerCheapest` and the bound provider is now cheapest

Notification payload includes the alert ID so tapping deep-links to `sendrate://alert/<id>` ([navigation](../architecture/navigation.md)).

## Push notifications

| Platform | Transport |
|---|---|
| iOS | APNs via the backend |
| Android | FCM |
| Web | Web Push (VAPID) — opt-in only |

Categories:
- **Rate move** — pair-level, > N% move in 24h. User-subscribed per pair.
- **Sponsored offer** — gated on user opt-in (Settings → Marketing).
- **System** — transactional only.

## Permission flow

Triggered in [onboarding](../modules/onboarding.md) step 4. If declined, re-prompt path is Settings → Notifications. Never re-prompt automatically.

## Replaces

Stubbed `NotificationService` in `SendRate/Core/Services/Services.swift` — currently empty bodies.

## Open questions

- Background-fetch budget: which alerts can run silently vs require app open?
- Server-side scheduling of local-feeling notifications when device is offline? (Probably not v1.)
