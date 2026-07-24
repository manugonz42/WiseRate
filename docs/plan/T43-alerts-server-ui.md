# T43 — Migrate Alerts UI to server storage

## Dependencies
- **Reads:** [alerts module](../modules/alerts.md), `web/app/(tabs)/alerts/page.tsx`, T42 service (`web/lib/services/alerts.ts`), T41 (`AccountGate`)
- **Task deps:** T41, T42

## Used by
- End users (the live Alerts tab), T44 (rows it creates are what the cron evaluates)

## Goal
Swap the Alerts page off localStorage onto the Supabase-backed service. The page now always runs for a logged-in user (behind T41's gate), so its alerts survive across devices and become eligible for email delivery (T44).

## Pre-made decisions (binding)
- **Replace** the `listAlerts`/`upsertAlert`/`deleteAlert` imports from `web/lib/services/persistence.ts` with the T42 `alerts.ts` service. CRUD becomes async (reads/writes hit Supabase); handle loading + error states (skeleton on load, inline error on write failure). Optimistic update is fine but reconcile on failure.
- **Drop `providerCheapest`** from the type selector (v1 = `rateAbove` / `rateBelow` only, per T42). Remove its option, its `typeLabel` arm, and the provider `<select>`. Keep the `?rate=` prefill deep link.
- **Banner copy change:** the current "saved in this browser / checked while a tab is open / email coming soon" banner is now false. Replace with: alerts are saved to your account and we'll **email you at `<account email>`** when one triggers (pull the email from the session). Keep it dismissible (`BANNER_KEY` bump to `v2`).
- **Cap = 3 enabled** stays; the count now comes from the server list. Upsell copy unchanged (Premium coming soon).
- **Validation unchanged:** target > 0 and within ±50% of current mid-market (`quotes.rate.rate`).
- All new/changed copy via i18n (`alerts.*` keys), `en`/`es` real, no machine `tl`. Pistacho tokens; SulitSend copy.

## Steps
1. Spec first: `alerts.md` acceptance criteria — "saved in this browser" note removed, storage = account; `notifyType` list drops `providerCheapest` for web (keep it documented as iOS/v2).
2. Rewrite the data layer of `alerts/page.tsx` (async CRUD, loading/error), remove `providerCheapest` UI, new banner copy + email interpolation.
3. i18n key updates.

## Verify
- Playwright (logged-in): create an alert → appears in Active + persists across reload (server, not localStorage — confirm via a second browser context sharing the session, or by querying the row); toggle/delete work; 4th enabled → upsell; invalid rate → inline error. Banner shows the account email.
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No cron/email sending (T44), no `providerCheapest`, no changes to Home/Compare, no new deps. Do not delete the localStorage helpers in `persistence.ts` (Home/Compare favorites, provider-accounts still use them) — only stop the Alerts page from using the alert ones.
