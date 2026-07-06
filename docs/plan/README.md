# Execution plan

## Active — MVP launch readiness (planned 2026-07-06)

Goal: web MVP 100% presentable to affiliate/partner reviewers (Wise, Remitly, WU, TransferGo, brokers — application guide: `SolicitarAfiliados.md`, repo root). Same protocol as below: **"proceed TXX"**, in order, verify gate per task.

- [x] [T17 — Trust & transparency pages](T17-trust-pages.md): /about, /how-we-make-money, /terms (DRAFT), contact email, inline affiliate disclosure
- [x] [T18 — Production polish](T18-production-polish.md): drop disabled Profile tab, 404/error pages, no mock quotes in prod, honest provider fallback
- [ ] [T19 — Provider editorial coverage](T19-provider-coverage.md): profile every provider visible in default compare lists
- [ ] [T20 — Deploy readiness](T20-deploy-readiness.md): DEPLOY.md runbook, preview noindex, env audit, merge to main
- [ ] [T21 — QA sweep + status flip](T21-qa-sweep.md): Playwright pass over every route × 2 viewports, fix all, MODULES.md → ✅

## Done — SEO slice (Phase 5 pulled forward, planned 2026-07-03)

Next codeable work: Phase 2 (iOS) is Mac-blocked and Phase 1's remainder is human-only, so the ROADMAP Phase 5 SEO item was pulled forward. Say **"proceed TXX"** to execute a task; each task file carries binding pre-made decisions, steps, and its verify gate (`npm test && npm run build && npm run lint` minimum). Execute in order — later tasks depend on earlier ones.

- [x] [T12 — SEO foundation (web app)](T12-seo-foundation.md): metadata/canonical/OG image/robots/sitemap
- [x] [T13 — Corridor SEO page EUR→PHP](T13-corridor-page.md): `/send/eur-to-php`, registry, FAQ + JSON-LD ([spec](../modules/corridors.md))
- [x] [T14 — Provider pages metadata + internal linking](T14-provider-seo.md)
- [x] [T15 — Landing SEO](T15-landing-seo.md): hreflang en/es/tl, robots/sitemap, JSON-LD, cross-link to app
- [x] [T16 — Corridor expansion](T16-corridor-expansion.md): verify GBP/USD/CAD/AUD→PHP, ship passing ones

Site-wide SEO rules that outlive these tasks live in [modules/corridors.md](../modules/corridors.md) (notably: never emit AggregateRating/Review JSON-LD).

## Phase 1 record

ROADMAP Phase 1 (+ the codeable slice of Phase 3) was broken into 11 mechanical tasks and **fully executed 2026-07-03** (commits `f9dcd4e`…`e8d93db`, task title = commit message). The task files are deleted; recover any from git history. Their durable decisions live in the specs and code they produced:

| Task | Landed as |
|---|---|
| T01 parser fixture tests | `web/lib/services/providers/__tests__` + `__fixtures__`, vitest; parsers split `buildRequest`/`parseX`/`fetchX` |
| T02 health endpoint | `/api/health` — [exchange-rate](../services/exchange-rate.md#health) |
| T03 history API | `/api/history` (Frankfurter, no 24H) — [exchange-rate](../services/exchange-rate.md) |
| T04–T07 screens | Home, Provider Detail (Recharts, editorial data in `web/lib/data/providers.ts`), Alerts (localStorage CRUD, cap 3), Analytics (7D/30D live, ≥3M gated) |
| T08 brokers card | `web/lib/brokers.ts`, threshold €5,000 — [brokers](../modules/brokers.md) |
| T09 legal | `/privacy`, `/cookies` (DRAFT), consent banner, footer |
| T10 analytics | PostHog EU, consent-gated — [analytics service](../services/analytics.md) |
| T11 KV cache | Upstash + Map fallback, `web/lib/services/cache.ts` |

## Runtime UI verification (reusable recipe)

`playwright` + headless Chromium are devDependencies in `web/`. Start `npm run dev` (3000 may be taken — note the port), drive pages from a Node script via `chromium.launch()`. Caveats: use `waitUntil: "domcontentloaded"` (`networkidle` times out on first compile), and **wait for a client-rendered element before interacting** — inputs exist in SSR markup before hydration, so typing too early is silently lost.

## Human-only checklist (still open)

- [ ] Verify SulitSend: EUIPO + domain + both-store search → buy `sulitsend.app`
- [ ] Contact email: create real address (e.g. `hello@sulitsend.app` forwarding) → set `CONTACT_EMAIL` in `web/lib/site.ts` (after T17)
- [ ] Legal review now also covers `/terms` draft (after T17)
- [ ] Send affiliate/broker applications following `SolicitarAfiliados.md` (repo root) — after deploy, the live site is the credential
- [ ] `git push` of the T17–T21 work + merged `main` (T20 merges locally, never pushes)
- [ ] Affiliate signups: Wise (Partnerize), Remitly, WU, TransferGo → paste real affiliate URLs (`web/lib/data/providers.ts`)
- [ ] Broker introducer applications: TorFX, Currencies Direct, OFX → confirm EUR→PHP coverage; replace URLs in `web/lib/brokers.ts`
- [ ] Vercel project + Pro when affiliate links go live; landing at root, app at `app.sulitsend.app`
- [ ] PostHog account (EU) → `NEXT_PUBLIC_POSTHOG_KEY`/`_HOST` env vars
- [ ] UptimeRobot monitor on `/api/health`
- [ ] Upstash Redis database → env vars
- [ ] Legal review of the draft policies + contact email (`TODO(human)` in `/privacy`)
- [ ] Post-deploy SEO (after T12–T16 + deploy): Google Search Console + Bing Webmaster for both domains, submit both sitemaps, spot-check OG cards (opengraph.xyz)
- [ ] Resend account (Phase 3 alert emails — decided 2026-07-03) → API key env var, verify sending domain
