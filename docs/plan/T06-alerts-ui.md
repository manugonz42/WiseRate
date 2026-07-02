# T06 — Alerts screen (UI + CRUD only)

## Dependencies
- **Reads:** [alerts](../modules/alerts.md) (acceptance + **planning note** — binding), [data-model](../architecture/data-model.md) (`RateAlert`), [persistence](../services/persistence.md)
- **Task deps:** none

## Used by
- Tab 4; T07 links here with a prefilled rate; Phase 3 backend replaces the storage layer

## Goal
Alerts CRUD at `web/app/(tabs)/alerts/page.tsx` backed by localStorage. **No alert evaluation, no notifications** — the spec's planning note forbids investing in client-side evaluation before Phase 3.

## Pre-made decisions
- Storage: `web/lib/services/persistence.ts` — typed localStorage wrapper: `listAlerts() / upsertAlert(a) / deleteAlert(id)` under key `sulitsend.alerts.v1`. SSR-safe (guard `typeof window`).
- Banner at top of the screen: "Alerts are saved on this device. Notifications arrive once server alerts ship." (info style, dismissible, remembered in localStorage).
- Free cap: 3 active alerts → creating a 4th shows an inline "Premium — coming soon" notice (no paywall).
- "Triggered" section: render with an empty state ("No alerts have fired yet") — nothing can trigger yet.
- Prefill: read `?rate=<n>` query param into the create form (T07 links with it).

## Steps
1. Mirror `RateAlert` from data-model.md into `web/lib/models/types.ts` — including `providerID?: string`, which the form must set (and require) when `notifyType === "providerCheapest"`.
2. Build `persistence.ts` as above (include the favorites API surface — `listFavorites()/toggleFavorite(id)` — even if unused yet, so T05's skip can be revisited cheaply).
3. Page per spec acceptance: Active + Triggered sections; create form (target rate input, type selector rate-above / rate-below / provider-cheapest, provider picker shown only for provider-cheapest — populate from `getQuotes(500)` provider list); toggle enable/disable (greyed-out when off); delete with confirm.
4. Validation per spec: rate > 0 and within ±50% of current mid-market (`getQuotes` rate).
5. Enable the Alerts tab in `web/app/(tabs)/layout.tsx`.
6. Update [MODULES.md](../MODULES.md) Alerts/Web ◐ ("UI + local CRUD; evaluation Phase 3"). Check off T06.

## Verify
Create → toggle → delete an alert; survives reload; 4th active alert blocked with upsell copy; `?rate=65.1` prefills; validation rejects 0 and out-of-band values. `npm run build && npm run lint`.

## Out of scope
Notification permission prompts, service workers, alert evaluation, backend sync, Premium purchase.
