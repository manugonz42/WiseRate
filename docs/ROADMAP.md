# Roadmap — path to launch

## Dependencies
- **Reads:** [MODULES.md](MODULES.md) (live status), [exchange-rate](services/exchange-rate.md), [subscriptions](services/subscriptions.md), [localization](architecture/localization.md)

## Used by
- `CLAUDE.md` (sequencing), anyone planning work or budget

**Priority logic:** the web affiliate flow earns money with no store approval, no annual fees, and no Mac — it ships first. iOS second (highest-paying users, StoreKit already done). Backend third (unlocks push alerts everywhere). Android last (scaffold exists; cheapest store, strictest new-account testing rules).

All prices ≈ July 2026, EUR, VAT excluded. Recurring costs marked /yr or /mo.

---

## Phase 1 — Web MVP live 🔴 now

**Goal:** `wiserate.app` public — Landing + Compare with real quotes and working affiliate links (first revenue).

- [ ] Port remaining web screens in order: Home → Provider Detail → Alerts (local, IndexedDB) → Analytics
- [ ] Affiliate program signups: Wise, Remitly, WU, TransferGo — also unblocks the legal question in [exchange-rate](services/exchange-rate.md)
- [ ] Deploy: landing at root, app at `app.wiserate.app`
- [ ] Privacy policy + cookie banner (DIY / Termly free tier)
- [ ] Web analytics: GA4 or PostHog free tier (Plausible 9 €/mo if cookieless preferred)

| Item | Cost |
|---|---|
| Domain `wiserate.app` (requires HTTPS, included via Vercel) | ~15 €/yr |
| Vercel Hobby → **Pro required once affiliate links go live** (Hobby forbids commercial use) | 0 € → ~19 €/mo |
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

- [ ] Point iOS (later Android) at the existing `web/app/api/quotes` proxy instead of per-app fetching
- [ ] Cron job (Vercel Cron, included in Pro) evaluating alert conditions
- [ ] Push: APNs + FCM directly (free) or via Firebase Cloud Messaging (free)
- [ ] Alert/user storage: Supabase / Turso / Vercel KV free tiers
- [ ] Rate-source fallback: Open Exchange Rates free 1 000 req/mo (paid ~11 €/mo only if needed)

**Phase total: 0 € incremental (rides on Vercel Pro + free tiers).**

## Phase 4 — Android on Google Play 🟢

**Goal:** bring the Compose scaffold to parity (real services via Phase 3 backend) and publish.

- [ ] Google Play Console — **25 $ ≈ 23 € one-time**
- [ ] ⚠️ Personal dev accounts: Google requires a closed test with **12 testers for 14 days** before production — recruit testers early
- [ ] Wire Retrofit services to `/api/quotes`, Room persistence, Play Billing for premium
- [ ] Play Store assets — DIY 0 €

**Phase total: ~23 € one-time.** (Play commission: 15 % on first $1 M/yr.)

## Phase 5 — Growth 🔵

- [ ] `es` + `tl` localization complete — human `tl` translation, freelance: **~60–150 € one-time**
- [ ] Referral program live (spec: [referral](modules/referral.md))
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
