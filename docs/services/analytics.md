# Service: Analytics

Event taxonomy + transport. Replaces `AnalyticsService` (currently just `print()`).

**Status:** Web = wired (PostHog EU, consent-gated via `web/lib/analytics.ts` + `web/lib/consent.ts`). No `NEXT_PUBLIC_POSTHOG_KEY` or consent not `"granted"` → `track()` logs to console in dev, no-ops in prod. iOS/Android still console-only.

## Dependencies
- **Reads:** — (none — opaque `userID` only)
- **Future:** ⏳ backend consent management endpoint, ⏳ event schema validation in CI

## Used by
- Every module — events grouped by surface below

## Transport

PostHog (recommended) or Mixpanel. One SDK per platform. Events flushed in batches; offline events buffered.

## Event taxonomy

Format: `<surface>.<action>` snake_case.

### Onboarding
- `onboarding.started`
- `onboarding.page_viewed` `{ page: 1..4 }`
- `onboarding.completed` `{ sendCurrency, receiveCurrency, notificationsGranted }`

### Home
- `home.viewed`
- `home.compare_tapped`
- `home.provider_tapped` `{ providerID }`
- `home.sponsored_tapped` `{ offerID }`

### Comparison
- `compare.viewed` `{ amount, from, to }`
- `compare.sort_changed` `{ sortBy }`
- `compare.provider_tapped` `{ providerID, position, sortBy }`
- `compare.affiliate_outbound` `{ providerID }` — web: fires from the row-level "Send" CTA (providers with an editorial profile)

### Provider Detail
- `provider.viewed` `{ providerID }`
- `provider.affiliate_outbound` `{ providerID }`
- `provider.favorite_toggled` `{ providerID, value }`

### Analytics
- `analytics.viewed` `{ timeFrame }`
- `analytics.timeframe_changed` `{ from, to }`

### Alerts
- `alert.created` `{ targetRate, notifyType }`
- `alert.toggled` `{ alertID, isEnabled }`
- `alert.deleted` `{ alertID }`
- `alert.fired` `{ alertID, notifyType }`

### Profile / Settings
- `profile.updated` `{ field }`
- `settings.changed` `{ key, value }`

### Premium
- `premium.viewed` `{ source }`
- `premium.plan_selected` `{ plan }`
- `premium.purchase_started` `{ plan }`
- `premium.purchase_succeeded` `{ plan }`
- `premium.purchase_failed` `{ plan, reason }`

### Referral
- `referral.viewed`
- `referral.shared` `{ channel }`

## PII

No emails, names, or device IDs in event properties. User identification uses an opaque `userID` set on app first launch.

## Consent

Onboarding step 4 doubles as analytics consent in GDPR markets. If declined, events drop locally — nothing leaves the device.
