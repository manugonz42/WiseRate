# Roadmap — path to launch

## Dependencies
- **Reads:** [MODULES.md](MODULES.md) (live status), [exchange-rate](services/exchange-rate.md), [subscriptions](services/subscriptions.md), [localization](architecture/localization.md)

## Used by
- `CLAUDE.md` (sequencing), anyone planning work or budget

**Priority logic:** web affiliate flow first (earns with no store approval, fees, or Mac) → iOS (highest-paying users, StoreKit done) → backend (unlocks push alerts) → Android (scaffold exists; strictest new-account testing rules).

Prices ≈ July 2026, EUR, VAT excluded.

---

## Phase 1 — Web MVP live 🔴 now

**Goal:** `sulitsend.com` public — Landing + Compare with real quotes and working affiliate links (first revenue). Code side executed as tasks T01–T11 — see [plan/](plan/README.md) for the record + remaining human-only checklist.

- [x] ⚠️ **Name chosen (2026-07-02): SulitSend** — working name; "WiseRate" contained the Wise trademark (affiliate programs and App Store rule 2.3.7 reject look-alikes). User-facing strings renamed everywhere.
  - [ ] Before opening dev accounts: EUIPO + domain + both-store checks → buy `sulitsend.com` (decided 2026-07-14; defensive `sulitsend.app` deferred until first revenue)
  - [ ] Internal identifiers keep legacy naming until the definitive rebrand — rename each **before it becomes permanent**: `WiseRate/` + `WiseRate-Web/` dirs and Swift types, `com.wiserate` package, `wiserate://` scheme, `wiserate_premium_*` SKUs (immutable once in App Store Connect / Play), `project.yml` bundle ids
- [x] Parser fixture tests + `/api/health` broken-parser alerting (T01–T02)
- [x] Web screens ported: Home, Provider Detail, Alerts (UI only — real alerts Phase 3), Analytics (T04–T07)
- [x] Privacy policy + cookie consent banner, DIY drafts pending legal review (T09)
- [x] Product analytics: PostHog EU free tier, consent-gated (T10)
- [ ] Affiliate signups: Wise, Remitly, WU, TransferGo — also unblocks the legal question in [exchange-rate](services/exchange-rate.md). These pay **one-time CPA per new customer** (Wise £10 personal / £50 business; Remitly ~$2–20 by corridor) — no rev-share exists for remittance affiliates; sustainability = new-user volume (SEO)
- [ ] Broker introducer signups (TorFX, Currencies Direct, OFX) — brokers pay **lifetime rev-share per referred client's trades**, the only recurring per-transaction income without a payment license ([brokers](modules/brokers.md)); card UI shipped (T08)
- [ ] Deploy: landing at root, app at `app.sulitsend.com`

| Item | Cost |
|---|---|
| Domain `sulitsend.com` (HTTPS via Vercel) | ~15 €/yr |
| Vercel Hobby → **Pro required once affiliate links go live** (Hobby forbids commercial use) | 0 € → ~19 €/mo |
| — or VPS (Hetzner CX) | ~5 €/mo |
| — or self-host at home behind Cloudflare Tunnel (see Hosting note) | ~0 € + ~25 €/yr electricity |

**Phase total: ~15 € up front, ~245 €/yr once commercial.**

## Phase 2 — iOS on the App Store 🟠

**Goal:** TestFlight beta → App Store release. StoreKit 2, SwiftData, local notifications already built.

- [ ] Mac access (dev machine is Windows — hard blocker): used Mac mini M1/M2 **400–600 €** (recommended) · MacinCloud ~25–45 €/mo · Xcode Cloud (25 h/mo free) covers CI only, not interactive dev
- [ ] Apple Developer Program — **99 €/yr**
- [ ] Create `.xcodeproj`, wire real onboarding, remove auto-complete flag in `WiseRateApp.swift`
- [ ] App Store assets (icon, screenshots, description en/es) — DIY 0 €
- [ ] RevenueCat free < $2.5k MTR (optional; StoreKit 2 alone is fine)
- [ ] Enroll App Store **Small Business Program** → 15 % commission

**Phase total: ~99 €/yr + 0–600 € Mac.**

## Phase 3 — Light backend 🟡

**Goal:** cross-platform parity pieces: shared `/api/quotes` for the apps, scheduled rate checks → push alerts.

**Alerts only become real here** — local-only alerts (web tab must stay open; iOS BGTaskScheduler best-effort) are demo-grade. Don't invest further in client-side alert evaluation before this phase.

- [ ] Point iOS (later Android) at the existing `web/app/api/quotes` proxy
- [x] Quotes cache off in-memory `Map` → Upstash Redis with Map fallback (T11)
- [ ] Cron job (Vercel Cron, in Pro) evaluating alert conditions
- [ ] Web alert delivery: **email via Resend** (decided 2026-07-03; free tier 3k/mo — user leaves email on alert creation, no auth). Push (APNs + FCM, free) when the apps need it
- [ ] Alert storage: **Upstash Redis** (decided 2026-07-03 — already integrated since T11; Supabase only if/when accounts arrive in Phase 5)
- [ ] Rate-source fallback: Open Exchange Rates free 1 000 req/mo (paid ~11 €/mo only if needed)

**Phase total: 0 € incremental.**

## Phase 4 — Android on Google Play 🟢

**Goal:** bring the Compose scaffold to parity (real services via Phase 3 backend) and publish. `android/` is **frozen until this phase** — reconcile divergence when it starts.

- [ ] Google Play Console — **25 $ ≈ 23 € one-time**
- [ ] ⚠️ Personal accounts: Google requires a closed test with **12 testers for 14 days** before production — recruit early
- [ ] Wire Retrofit to `/api/quotes`, Room persistence, Play Billing
- [ ] Play Store assets — DIY 0 €

**Phase total: ~23 € one-time.** (Play commission: 15 % on first $1 M/yr.)

## Phase 5 — Growth 🔵

**Premium and Referral are gated here on purpose:** both need accounts/auth + backend (no earlier phase builds them) and traffic proving demand. Affiliate CPA + broker rev-share are the monetization until then — a paywall competes with our own affiliate clicks.

- [ ] `es` + `tl` localization complete — human `tl` translation, freelance **~60–150 €**
- [ ] i18n single source: one canonical strings file generating `Localizable.xcstrings` / `strings.xml` / web JSON (today hand-maintained per platform; web has no i18n wired)
- [ ] Referral program ([referral](modules/referral.md)) — needs backend `ReferralService` + anti-fraud
- [ ] Premium cross-platform (web Stripe ~1.5 % + 0.25 €/EU charge, no fixed cost — decide then)
- [ ] SEO: per-corridor landing pages (EUR→PHP first), sitemap — **pulled forward 2026-07-03** as tasks T12–T16 ([plan/](plan/README.md), [corridors](modules/corridors.md)); Phase 5 keeps only what those tasks exclude (localized corridor copy, further corridors)
- [ ] Optional: iubenda-class legal upgrade ~5–30 €/mo when traffic justifies

---

## Budget summary (first year)

| Scenario | One-time | Recurring /yr |
|---|---|---|
| Web only (Phase 1) | ~0 € | ~245 € (domain 15 + Vercel Pro 228) |
| + iOS, Mac already available | 0 € | ~345 € |
| + iOS with used Mac mini | 400–600 € | ~345 € |
| + Android + `tl` translation | +85–175 € | ~345 € |
| **Realistic full launch, first year** | **~500–800 €** | **~350 €/yr thereafter** |

Not budgeted: time, paid marketing, an LLC (start as individual/autónomo; revisit if revenue becomes significant).

## Hosting note

In order of cost/reliability — home hosting is fine pre-revenue; move up when affiliate links go live:

1. **Home server (~0 €/mo):** laptop (battery = free UPS) + Cloudflare Tunnel free (fixes CGNAT, no open ports, TLS, hides home IP) + UptimeRobot. A power cut kills router/ONT too, so a small UPS for them (~60 €) matters more than a second machine. ~99–99.5 % uptime.
2. **VPS (~5 €/mo):** Hetzner/Contabo. Always-on cron, no home coupling. Best €/reliability once anything depends on uptime.
3. **Vercel Pro (~19 €/mo):** zero-ops, Cron + KV integrated. Default once revenue covers it.
