# Roadmap — path to launch

## Dependencies
- **Reads:** [MODULES.md](MODULES.md) (live status), [exchange-rate](services/exchange-rate.md), [subscriptions](services/subscriptions.md), [localization](architecture/localization.md)

## Used by
- `CLAUDE.md` (sequencing), anyone planning work or budget

**Priority logic:** the web affiliate flow earns money with no store approval, no annual fees, and no Mac — it ships first. iOS second (highest-paying users, StoreKit already done). Backend third (unlocks push alerts everywhere). Android last (scaffold exists; cheapest store, strictest new-account testing rules).

All prices ≈ July 2026, EUR, VAT excluded. Recurring costs marked /yr or /mo.

---

## Phase 1 — Web MVP live 🔴 now

**Goal:** `sulitsend.app` public — Landing + Compare with real quotes and working affiliate links (first revenue).

> Mechanical execution breakdown of this phase (+ the codeable slice of Phase 3): [docs/plan/](plan/README.md) — self-contained tasks for code-model sessions.

- [x] ⚠️ **Name chosen (2026-07-02): SulitSend** — working name; "WiseRate" contained the Wise trademark (affiliate programs reject look-alike brands; App Store rule 2.3.7 can too). User-facing strings renamed (web, landing, iOS display copy, docs, npm package names). Shortlist considered: SulitSend · PisoRate · RemitScan · PadalaKo
  - [ ] Still before opening dev accounts: EUIPO + domain + both-store checks → buy `sulitsend.app`
  - [ ] Internal identifiers keep legacy naming until the definitive rebrand — rename each **before it becomes permanent**: `WiseRate/` + `WiseRate-Web/` dirs and Swift type names, `com.wiserate` Android package, `wiserate://` deep-link scheme, `wiserate_premium_*` SKUs (immutable once in App Store Connect / Play), `project.yml` bundle ids
- [ ] Fixture tests for `web/lib/services/providers/*` parsers + broken-parser alerting — the revenue flow must not fail silently
- [ ] Port remaining web screens in order: Home → Provider Detail → Alerts (UI only — real alerts are Phase 3) → Analytics
- [ ] Affiliate program signups: Wise, Remitly, WU, TransferGo — also unblocks the legal question in [exchange-rate](services/exchange-rate.md). These pay **one-time CPA per new customer** (Wise £10 personal / £50 business; Remitly ~$2–20 by corridor) — no rev-share exists for remittance affiliates; sustainability comes from new-user volume (SEO), not per-transaction income
- [ ] Broker introducer signups (TorFX, Currencies Direct, OFX) + high-amount broker card in Compare — brokers pay **lifetime revenue share on every trade** of a referred client, the only recurring per-transaction income available without a payment license (spec: [brokers](modules/brokers.md))
- [ ] Deploy: landing at root, app at `app.sulitsend.app`
- [ ] Privacy policy + cookie banner (DIY / Termly free tier)
- [ ] Web analytics: GA4 or PostHog free tier (Plausible 9 €/mo if cookieless preferred)

| Item | Cost |
|---|---|
| Domain `sulitsend.app` (requires HTTPS, included via Vercel) | ~15 €/yr |
| Vercel Hobby → **Pro required once affiliate links go live** (Hobby forbids commercial use) | 0 € → ~19 €/mo |
| — or VPS (Hetzner CX-class) instead of Vercel | ~5 €/mo |
| — or self-host at home behind Cloudflare Tunnel (see Hosting note below) | ~0 € + ~20–30 €/yr electricity |
| Affiliate signups, DIY legal, analytics free tiers | 0 € |

**Phase total: ~15 € up front, ~245 €/yr once commercial.**

## Phase 2 — iOS on the App Store 🟠

**Goal:** TestFlight beta → App Store release. StoreKit 2, SwiftData, local notifications already built.

- [ ] Mac access (dev machine is Windows — hard blocker, pick one):
  - used Mac mini M1/M2: **400–600 € one-time** (recommended)
  - MacinCloud / cloud Mac: ~25–45 €/mo
  - Xcode Cloud (25 h/mo free with membership) covers CI, **not** interactive dev
- [ ] Apple Developer Program — **99 €/yr**
- [ ] Create `.xcodeproj`, wire real onboarding, remove auto-complete flag
- [ ] App Store assets (icon, screenshots, description en/es) — DIY 0 €
- [ ] RevenueCat for IAP ops/analytics — free < $2.5k MTR (optional; StoreKit 2 alone is fine)
- [ ] Enroll App Store **Small Business Program** → 15 % commission instead of 30 %

**Phase total: ~99 €/yr + 0–600 € Mac.**

## Phase 3 — Light backend 🟡

**Goal:** server-side pieces that unlock cross-platform parity: shared `/api/quotes` for the apps, scheduled rate checks → push alerts.

**Alerts only become real here** — local-only alerts (web tab must stay open; iOS BGTaskScheduler is best-effort) are demo-grade. Don't invest further in client-side alert evaluation before this phase.

- [ ] Point iOS (later Android) at the existing `web/app/api/quotes` proxy instead of per-app fetching
- [ ] Move quotes cache off in-memory `Map` (dies on serverless cold starts, not shared across instances) → Vercel KV / Upstash free tier
- [ ] Cron job (Vercel Cron, included in Pro) evaluating alert conditions
- [ ] Push: APNs + FCM directly (free) or via Firebase Cloud Messaging (free)
- [ ] Alert/user storage: Supabase / Turso / Vercel KV free tiers
- [ ] Rate-source fallback: Open Exchange Rates free 1 000 req/mo (paid ~11 €/mo only if needed)

**Phase total: 0 € incremental (rides on Vercel Pro + free tiers).**

## Phase 4 — Android on Google Play 🟢

**Goal:** bring the Compose scaffold to parity (real services via Phase 3 backend) and publish.

The `android/` scaffold is **frozen until this phase** — don't port data-model or feature changes there earlier; reconcile divergence when the phase starts.

- [ ] Google Play Console — **25 $ ≈ 23 € one-time**
- [ ] ⚠️ Personal dev accounts: Google requires a closed test with **12 testers for 14 days** before production — recruit testers early
- [ ] Wire Retrofit services to `/api/quotes`, Room persistence, Play Billing for premium
- [ ] Play Store assets — DIY 0 €

**Phase total: ~23 € one-time.** (Play commission: 15 % on first $1 M/yr.)

## Phase 5 — Growth 🔵

**Premium and Referral are gated here on purpose:** both need accounts/auth + backend (neither exists, no earlier phase builds them) and traffic proving demand. Affiliate CPA + broker rev-share are the primary monetization until then — a paywall competes with your own affiliate clicks. Premium is the recurring revenue the product itself controls; broker rev-share ([brokers](modules/brokers.md)) is the recurring revenue per referred client.

- [ ] `es` + `tl` localization complete — human `tl` translation, freelance: **~60–150 € one-time**
- [ ] i18n single source: one canonical strings file generating `Localizable.xcstrings` / `strings.xml` / web JSON (today each platform is hand-maintained; web has no i18n wired at all yet)
- [ ] Referral program live (spec: [referral](modules/referral.md)) — needs backend `ReferralService` + anti-fraud
- [ ] Premium cross-platform (web Stripe? decide then — Stripe ~1.5 % + 0.25 € per EU charge, no fixed cost)
- [ ] SEO: per-corridor landing pages (EUR→PHP first), sitemap
- [ ] Optional: iubenda-class legal upgrade ~5–30 €/mo when traffic justifies it

---

## Budget summary (first year)

| Scenario | One-time | Recurring /yr |
|---|---|---|
| Web only (Phase 1) | ~0 € | ~245 € (domain 15 + Vercel Pro 228) |
| + iOS (Phase 2), Mac already available | 0 € | ~345 € |
| + iOS with used Mac mini | 400–600 € | ~345 € |
| + Android (Phase 4) + `tl` translation | +85–175 € | ~345 € |
| **Realistic full launch, first year** | **~500–800 €** | **~350 €/yr thereafter** |

Not budgeted: your time, paid marketing, an LLC/company (start as individual/autónomo; revisit if affiliate revenue becomes significant).

## Hosting note

Three viable tiers, in order of increasing cost/reliability. Home hosting is fine pre-revenue; move up when affiliate links go live.

1. **Home server (~0 €/mo):** laptop as primary (built-in battery = free UPS) + Cloudflare Tunnel free (fixes dynamic IP/CGNAT, no open ports, TLS, hides home IP) + UptimeRobot free. Weak point: a power cut kills the router/ONT too, so a second machine adds nothing there — a small UPS for router+ONT (~60 €) matters more. Expect ~99–99.5 % uptime.
2. **VPS (~5 €/mo):** Hetzner/Contabo class. Always-on cron for alerts, no home-network coupling. Best €/reliability once anything depends on uptime.
3. **Vercel Pro (~19 €/mo):** zero-ops, preview deploys, Cron + KV integrated. Default once revenue covers it.
