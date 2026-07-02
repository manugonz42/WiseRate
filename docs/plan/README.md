# Execution plan — mechanical tasks for code models

Step-by-step breakdown of [ROADMAP](../ROADMAP.md) Phase 1 (+ the codeable slice of Phase 3) into self-contained tasks a code model (Sonnet-class) can execute without making product decisions. All decisions are pre-made inside each task.

## How to run a task

One session per task, in order. Prompt template:

> Read `docs/plan/README.md` (rules), then execute `docs/plan/T0X-<name>.md` exactly. Do not exceed its scope. When done, run the Verify section, check the task off in `docs/plan/README.md`, and update `docs/MODULES.md` if the task says so.

## Global rules (apply to every task)

1. **Scope is the task file.** No refactors, renames, or "improvements" outside the listed files.
2. **Specs win.** If a task contradicts a spec in `docs/`, stop and report — don't guess.
3. **Never touch:** `android/` (frozen until Phase 4), `WiseRate-Web/` (frozen prototype), internal identifiers (`WiseRate/` dirs, `com.wiserate`, `wiserate://`, `wiserate_premium_*` SKUs — see ROADMAP Phase 1 rename item).
4. **Brand name in UI copy: SulitSend.** Never "WiseRate" in new user-facing strings.
5. **Design tokens** come from `web/styles/tokens.css` / `web/tailwind.config.ts` (canonical: [design-system](../architecture/design-system.md)). Dark theme only. No new colors.
6. **Match existing code style** — study `web/app/(tabs)/compare/page.tsx` before writing any new page. Desktop-first rules: [platforms/web](../platforms/web.md).
7. Every task ends with: `cd web && npm run build && npm run lint` passing (plus the task's own Verify steps).
8. New TS types mirror [data-model](../architecture/data-model.md) — copy field names exactly.
9. Commit per task: `T0X: <task title>`.

## Task order

| # | Task | Phase | Blocked by |
|---|---|---|---|
| ☑ T01 | [Provider parser fixture tests](T01-parser-fixture-tests.md) | 1 | — |
| ☑ T02 | [Quote-source health endpoint](T02-health-endpoint.md) | 1 | T01 |
| ☑ T03 | [Historical rates API](T03-history-api.md) | 1 | — |
| ☑ T04 | [Home screen](T04-home-screen.md) | 1 | T03 |
| ☐ T05 | [Provider Detail screen](T05-provider-detail.md) | 1 | T03 |
| ☐ T06 | [Alerts screen (UI only)](T06-alerts-ui.md) | 1 | — |
| ☐ T07 | [Analytics screen](T07-analytics-screen.md) | 1 | T03 |
| ☐ T08 | [Brokers card in Compare](T08-brokers-card.md) | 1 | — |
| ☐ T09 | [Privacy, cookies, footer](T09-legal-pages.md) | 1 | — |
| ☐ T10 | [Product analytics wiring](T10-analytics-wiring.md) | 1 | T09 |
| ☐ T11 | [Quotes cache → Upstash KV](T11-kv-cache.md) | 3 | — |

Not specced here (need human accounts/hardware or design decisions first): iOS Phase 2 (Mac + Apple account), Phase 3 cron + push alerts (backend/auth design), Phase 4 Android wiring.

## Human-only checklist (not for the model)

- [ ] Verify SulitSend: EUIPO + domain + both-store search → buy `sulitsend.app` (ROADMAP Phase 1)
- [ ] Affiliate signups: Wise (Partnerize), Remitly, WU, TransferGo → paste real affiliate URLs/IDs when granted
- [ ] Broker introducer applications: TorFX, Currencies Direct, OFX → confirm EUR→PHP coverage + placement terms
- [ ] Vercel project + Pro upgrade when affiliate links go live; deploy landing at root, app at `app.sulitsend.app`
- [ ] PostHog account (EU cloud) → `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST` env vars (T10)
- [ ] UptimeRobot monitor on `/api/health` (after T02)
- [ ] Upstash Redis database → env vars (T11)
- [ ] Legal review of the T09 draft policies before launch
