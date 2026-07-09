# T31 — Web onboarding: first-visit 3-step intro (skippable, localStorage flag)

## Dependencies
- **Reads:** [onboarding module](../modules/onboarding.md), [navigation](../architecture/navigation.md) (Onboarding gate + "Web gap"), `web/app/(tabs)/layout.tsx`, `web/components/ProviderAccounts.tsx` (T28), `LanguageSelect` + default-amount control (T29/T30)
- **Task deps:** T28, T29, T30

## Used by
- `A_mejorar.md` item 4; closes the "Web gap" note in navigation.md

## Goal
First visit to any tab screen shows a lightweight 3-step intro overlay. Decision 2026-07-09: web onboarding is a **dismissable modal**, not the app's blocking 4-page gate — web visitors often arrive deep-linked from SEO and must never be walled off.

## Pre-made decisions (binding)
- **Component:** `web/components/Onboarding.tsx` (client), rendered from `(tabs)/layout.tsx`. Mount logic: `useEffect` after hydration → if `localStorage["sulitsend.onboarded.v1"]` absent, open. Client-effect-only means SSR/crawlers never see it (SEO-safe) — keep it that way.
- **Only on `(tabs)` routes.** Legal/corridor/provider pages never show it.
- **Steps:**
  1. Value prop: SulitSend compares live EUR→PHP transfer prices across providers; honest-monetization line ("We may earn a commission — you pay the same") linking /how-we-make-money.
  2. Preferences: `LanguageSelect` + the default-send-amount input (same controls/persistence as Settings — import, don't duplicate).
  3. Promos: one-line explanation + `<ProviderAccounts />` ("tick providers you already use so we can flag which first-transfer promos still apply") + "Done" button.
- **Chrome:** dots for the 3 steps, Next/Back, and a "Skip" button always visible. Skip, Done, Esc, and backdrop click all set `sulitsend.onboarded.v1 = "1"` and close — no way to soft-lock the app.
- **A11y:** `role="dialog"` `aria-modal="true"`, focus moves into the modal on open and back on close, Tab cycles inside (simple manual trap is fine — no new deps).
- **Reset:** in Settings "Data & privacy", add button "Replay intro" (localized) → removes the key and opens the modal.
- All strings via i18n (`onboarding.*`, en + es, regenerate tl mirror). Styling: dark tokens, surface-elevated card, mobile-first (full-width sheet at 390px, centered card ≥ sm).

## Steps
1. Spec first: add a "Web" section to `docs/modules/onboarding.md` (3 steps above, modal not gate, flag key); update navigation.md "Web gap" paragraph (resolved — modal onboarding) and MODULES.md Onboarding web ☐* → ◐ "(modal intro)".
2. Build component + layout wiring + settings reset button.
3. i18n keys.

## Verify
- Playwright: fresh context → /home shows the modal after hydration; Skip → gone; reload → stays gone; Settings → Replay intro → shows again; complete via steps → prefs persisted (language/amount/accounts identical to setting them in Settings); deep link straight to /compare in a fresh context also shows it once. `curl` the SSR HTML of /home → no onboarding markup.
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No currency-pair selection (single corridor), no notification permission step (web alerts are local, Phase 3), no blocking gate, no cookies, no animation libraries.
