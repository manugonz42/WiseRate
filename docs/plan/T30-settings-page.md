# T30 — Web settings page (/settings, gear entry, localStorage-backed)

## Dependencies
- **Reads:** [settings module](../modules/settings.md), [navigation](../architecture/navigation.md), `web/app/(tabs)/layout.tsx`, `web/lib/services/persistence.ts`, `web/components/ProviderAccounts.tsx` (T28), `web/lib/i18n.ts` (T29)
- **Task deps:** T28, T29

## Used by
- `A_mejorar.md` item 1; T31 (onboarding reuses the same controls; reset-onboarding lives here)

## Goal
A light web Settings page. Decision 2026-07-09: web settings are **local preferences only** (no account) — the app-phase Settings module (notifications, premium, etc.) stays iOS-first per MODULES.md; this page is the web-appropriate subset.

## Pre-made decisions (binding)
- **Route:** `web/app/(tabs)/settings/page.tsx` (+ metadata layout like other tabs). NOT a 6th tab.
- **Entry points:** a `GearSix` phosphor icon button, `aria-label` = localized "Settings", in the same three spots as T29's language selector (immediately next to it): mobile header, desktop narrow sidebar bottom, Home desktop top-right nav.
- **Sections (in order):**
  1. **Language** — the T29 `LanguageSelect`, full-width row with label.
  2. **Default send amount** — numeric input, same clearing rules as T23; persisted as `sulitsend.defaultAmount.v1` (string int ≥ 1) via two new persistence.ts functions `getDefaultAmount(): number | null` / `setDefaultAmount(n: number | null)`. Empty input clears the key (`null`). Consumers: `/compare` initial `amount` = stored value ?? 1000; `/home` initial chip = the chip from `AMOUNTS` **closest** to the stored value (ties → lower), ?? 200. Both read it once on mount.
  3. **Your provider accounts** — render `<ProviderAccounts />` (T28) with a line explaining it personalizes promo eligibility, link to /promos.
  4. **Data & privacy** — button "Clear local data": `window.confirm` (localized), then removes every localStorage key starting with `sulitsend.` and reloads; links to /privacy, /cookies, /terms. (T31 adds "Replay intro" here later — leave a placeholder comment.)
- All strings via i18n (en + es keys, `settings.*`).
- Dark theme tokens, page shell copied from the alerts page structure (header + stacked cards).

## Steps
1. Spec first: add a "Web (light)" section to `docs/modules/settings.md` describing exactly the four sections; update `docs/architecture/navigation.md` web note (settings reachable via gear, not a tab); MODULES.md Settings web ☐* → ◐ with a "(light, local-only)" note.
2. persistence.ts functions + page + gear entries + home/compare default-amount wiring.
3. i18n keys en/es (+ regenerate tl mirror).

## Verify
- Playwright: set default amount 500 → /compare loads with 500, /home selects the €500 chip; set 300 → /home selects €200 (closest-lower on tie is 200? 300 is equidistant to 200/500 → picks 200); clear the field → defaults back to 1000/200. Clear-local-data removes keys (check via `localStorage.length` for `sulitsend.` prefix) and the app still works. Gear visible at 390px, 768px, 1280px.
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No notification/premium/currency-pair settings (single corridor EUR→PHP for now), no account UI, no theme switcher (dark only), no changes to alerts storage.
