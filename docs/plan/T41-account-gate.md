# T41 — Account gate for Alerts & Promos (account required)

## Dependencies
- **Reads:** [auth service](../services/auth.md) (`getSession`, `onAuthStateChange`), [alerts module](../modules/alerts.md), [promos module](../modules/promos.md), [localization](../architecture/localization.md)
- **Task deps:** T29 (i18n wired), T34–T35 (auth + `/login`, `/signup` pages exist)

## Used by
- T43 (Alerts UI can assume a session once gated)

## Goal
From now on **Alerts and Promos require an account**. A logged-out user landing on `/alerts` or `/promos` sees an in-page notice / pop-up — *"You need an account to use this tool · create one in under a minute"* — with a CTA to sign up, in the correct locale. Not a hard redirect.

## Pre-made decisions (binding)
- **⚠️ Overrides a documented principle.** `auth.md` §"Anonymous fallback" and the ROADMAP say the affiliate flow must never gain a login wall. The user decided (2026-07-24) to gate **both** Alerts and Promos with a full account wall, knowing Promos carries affiliate "Claim" CTAs and this reduces anonymous affiliate reach. Record this override in `auth.md` and `promos.md` — do **not** silently contradict the old text; edit it. **Home and Compare stay 100% open** — never touch them.
- **Soft gate, not middleware redirect.** Build a reusable client component `web/components/AccountGate.tsx` (`{ feature: "alerts" | "promos"; children }`). It reads the session via the auth service (`getSession` + subscribe to `onAuthStateChange`); while unknown → render nothing/skeleton (avoid flash); no session → render the gate notice **instead of** `children`; session present → render `children`. Do not add these routes to `middleware.ts` (keep its matcher `/account/:path*` untouched).
- **Gate copy (i18n, new `gate.*` keys):** title, one-line body ("create one in under a minute"), primary CTA → `/signup?next=<path>`, secondary link → `/login?next=<path>`. `en` + `es` real; **never** commit machine-translated `tl` (localization.md rule). Feature name in the copy is interpolated (Alerts / Promos) via i18n.
- **Return path:** `/login` and `/signup` (T35) must honor a `?next=` query param and redirect there after success; if they don't yet, add it (default `/` when absent, allow only same-origin relative paths).
- **Analytics (consent-gated):** `track("gate.viewed", { feature })` on mount when gated, `track("gate.cta", { feature, action: "signup" | "login" })` on click.
- Pistacho tokens only; SulitSend in copy.

## Steps
1. Spec first: edit `auth.md` (anonymous fallback now excludes Alerts/Promos — note the deliberate override + date), `alerts.md` + `promos.md` status/notes ("account required"), `MODULES.md` if the state label changes.
2. `AccountGate.tsx` + `gate.*` i18n keys (`en`/`es`).
3. Wrap the content of `web/app/(tabs)/alerts/page.tsx` and `web/app/(tabs)/promos/page.tsx` in `<AccountGate>`.
4. `?next=` support in `/login` + `/signup` (same-origin guard).

## Verify
- Playwright: logged-out → `/alerts` and `/promos` show the gate (no alert form, no promo cards); click "create account" → `/signup?next=/alerts`; complete signup → lands back on `/alerts` with content. Logged-in → both render normally. Home/Compare unchanged logged-out.
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No middleware changes, no touching Home/Compare/Analytics/Onboarding, no new deps. Do not build the alerts server storage here (T42/T43) — the gate just controls visibility.
