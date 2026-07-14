# Execution plan

## Active — A_mejorar.md backlog (planned 2026-07-09)

Source: `A_mejorar.md` (repo root). Protocol: **"proceed TXX"**, strictly in order (later tasks depend on earlier ones). Each task file carries binding pre-made decisions — **follow them literally; if a step fails, an endpoint misbehaves, or reality contradicts the file, STOP and report instead of improvising.**

Global rules for every task below (in addition to CLAUDE.md):
- Touch only `web/` and `docs/` files the task names. Never `WiseRate/`, `android/`, `landing/`, `WiseRate-Web/`.
- No new npm dependencies except where a task names them (only T29: `i18next`, `react-i18next`).
- Never invent facts, promo amounts, fees, or provider capabilities — render only data from APIs or `providers.ts`.
- Spec first, then code (CLAUDE.md rule); UI copy says SulitSend; design-system (Pistacho) tokens only.
- Gate per task: `npm test && npm run build && npm run lint` + the task's Playwright check (recipe below). One commit per task, message = task title. Never push.

- [x] [T23 — Compare amount input clearable](T23-amount-input.md) (item 5)
- [ ] [T24 — Best deal inline, drop banner](T24-best-deal-inline.md) (item 6)
- [x] [T25 — Podium data coherence](T25-podium-coherence.md) (item 8)
- [ ] [T26 — Analytics: unlock 3M/6M/1Y](T26-analytics-unlock.md) (item 11)
- [ ] [T27 — Delivery-method fidelity](T27-delivery-methods.md) (item 7)
- [ ] [T28 — Promos hub + search + my provider accounts](T28-promos-hub.md) (items 9, 10)
- [ ] [T29 — Web i18n + language selector](T29-web-i18n.md) (item 2)
- [ ] [T30 — Web settings page](T30-settings-page.md) (item 1)
- [ ] [T31 — Web onboarding modal](T31-web-onboarding.md) (item 4)
- [ ] [T32 — Legal drafts: local-storage disclosure](T32-legal-localstorage-pass.md) (item 13, codeable part)

Resolved without a task (decisions 2026-07-09):
- **Item 12 (dynamic quote cache):** already shipped — T11 + `quotes.ts` key `quotes:v1:{from}:{to}:{amount}:{method}`, shared TTL cache (Upstash, Map fallback). TTL stays **120 s** (spec'd in exchange-rate.md): the cache is shared across all visitors so per-request API cost is already amortized, and Home advertises minute-fresh ranking; the per-provider fee-curve refinement the item mentions is already annotated as deferred in T22.
- **Item 3 (accounts/login/registration):** local-only profile via localStorage now (T28/T30/T31 cover prefs, provider accounts, onboarding); real auth stays gated to ROADMAP Phase 5 (Supabase candidate) — building it pre-revenue contradicts the roadmap and adds GDPR surface for no current benefit.
- **Item 13 (finish terms/cookies):** drafts are complete; what blocks "finished" is the human legal review (checklist below). T32 covers the only codeable gap (new localStorage disclosure).

## Done — MVP launch readiness (planned 2026-07-06)

Goal: web MVP 100% presentable to affiliate/partner reviewers (Wise, Remitly, WU, TransferGo, brokers — application guide: `SolicitarAfiliados.md`, repo root). Same protocol as below: **"proceed TXX"**, in order, verify gate per task.

- [x] [T17 — Trust & transparency pages](T17-trust-pages.md): /about, /how-we-make-money, /terms (DRAFT), contact email, inline affiliate disclosure
- [x] [T18 — Production polish](T18-production-polish.md): drop disabled Profile tab, 404/error pages, no mock quotes in prod, honest provider fallback
- [x] [T19 — Provider editorial coverage](T19-provider-coverage.md): profile every provider visible in default compare lists
- [x] [T20 — Deploy readiness](T20-deploy-readiness.md): DEPLOY.md runbook, preview noindex, env audit, merge to main
- [x] [T21 — QA sweep + status flip](T21-qa-sweep.md): Playwright pass over every route × 2 viewports, fix all, MODULES.md → ✅ (Provider Details stayed ◐ — T19 still open)
- [x] [T22 — Quote fidelity](T22-quote-fidelity.md): direct per-provider quote endpoints at the exact amount (only CurrencyFair cleared tier A; everyone else stays via Wise Comparisons, tagged), 5 banks dropped (no referral program), promo separation (first-transfer + referral) in the comparator

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

- [ ] Verify SulitSend: EUIPO + domain + both-store search → buy `sulitsend.com` (`.app` deferred until first revenue)
- [ ] Contact email: create real address (e.g. `hello@sulitsend.com` forwarding) → set `CONTACT_EMAIL` in `web/lib/site.ts` (after T17)
- [ ] Legal review now also covers `/terms` draft (after T17)
- [ ] Send affiliate/broker applications following `SolicitarAfiliados.md` (repo root) — after deploy, the live site is the credential
- [ ] `git push` of the T17–T22 work + merged `main` (T20 merges locally, never pushes)
- [ ] Affiliate signups: Wise (Partnerize), Remitly, WU, TransferGo, CurrencyFair → paste real affiliate URLs (`web/lib/data/providers.ts`); once any deal includes a referral bonus, populate `referralPromo` too (T22)
- [ ] Broker introducer applications: TorFX, Currencies Direct, OFX → confirm EUR→PHP coverage; replace URLs in `web/lib/brokers.ts`
- [ ] Deploy both Vercel projects + flip to Pro when affiliate links go live — follow [`DEPLOY.md`](DEPLOY.md) §1–4
- [ ] PostHog account (EU) → `NEXT_PUBLIC_POSTHOG_KEY`/`_HOST` env vars (`DEPLOY.md` §3)
- [ ] Upstash Redis database → env vars (`DEPLOY.md` §3)
- [ ] Legal review of the draft policies + contact email (`TODO(human)` in `/privacy`)
- [ ] Post-deploy checks: `DEPLOY.md` §6 (health/sitemap curls, OG spot-check, UptimeRobot, Search Console + Bing Webmaster, preview-noindex confirmation)
- [ ] Resend account (Phase 3 alert emails — decided 2026-07-03) → API key env var, verify sending domain
