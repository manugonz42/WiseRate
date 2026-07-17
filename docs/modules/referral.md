# Module: Referral

**Status:** iOS ◐ (mock) · Web ◐ (real service, T36) · Android ◐ (scaffold, frozen)

## Dependencies
- **Reads:** [auth](../services/auth.md) (`referral_code`/`referred_by` on `profiles`, RLS), [persistence](../services/persistence.md) (web: `sulitsend.ref.v1` capture key), [localization](../architecture/localization.md) (share message), [design-system](../architecture/design-system.md)
- **Future:** ⏳ iOS/Android `ReferralService` (codes + stats), ⏳ payout reconciliation + anti-fraud beyond self-referral/expiry (web: [T37](../plan/T37-referral-rewards.md))

## Used by
- [profile](profile.md) — sheet trigger ("Invite friends") / web `/account` link

## Purpose
Show the user their referral code, share it, and attribute signups that arrive through it. Reward payout is [T37](../plan/T37-referral-rewards.md), not this module.

## Inputs (data dependencies)
- iOS/Android: `ReferralViewModel.referralCode`, `.referralCount`, `.referralEarnings` — mock, `ReferralService` unspecced.
- Web: `AuthService.getProfile().referralCode`, `GET /api/referral/stats` (invited count; rewards stay 0 until T37).

## Outputs / Actions
- Tap "Copy code" → copy to clipboard + toast
- Tap "Share" → system share sheet with prefilled message + deep link. iOS/Android: `wiserate://?ref=<code>`. Web: `https://app.sulitsend.com/?ref=<code>` (analytics: `referral.shared { channel }`)
- Tap "How it works" → bottom sheet with terms (web: draft copy pending legal, flagged `// DRAFT` in source per the `/terms`-style convention)

## Acceptance criteria
- Code: 8 chars, uppercase, Crockford base32 (excludes `0 O 1 I`) — server-generated at account creation, unique (see [auth](../services/auth.md))
- Stats card: invited count, earnings (in user's preferred currency; web shows month-count, zeros until T37)
- Share message localized: en / es / tl

## Platform notes
- **iOS**: `WiseRate/Features/Referral/ReferralView.swift` — mock (`MARIA2024`-style fixture), unchanged by T36.
- **Web**: `web/app/(tabs)/account/referral/page.tsx` — see "Web: capture + attribution (T36)" below.
- **Android**: `android/.../features/referral/ReferralScreen.kt` — mock, frozen.

## Web: capture + attribution (T36)

Real Supabase-backed flow, additive to [auth](../services/auth.md)'s accounts foundation (T34/T35). No app-store deep links, no click/conversion tracking (that's [T37](../plan/T37-referral-rewards.md)'s sub-ID work), no emails.

- **Share link:** `https://app.sulitsend.com/?ref=<CODE>`, honored on every route.
- **Capture:** client-side in `web/app/(tabs)/layout.tsx` (`components/ReferralCapture.tsx`), not middleware — keeps pages static/cacheable. Validates the Crockford format, then stores `{ code, at }` in `localStorage["sulitsend.ref.v1"]` (`web/lib/services/persistence.ts`) — last-touch wins, 30-day expiry, no cookie. Analytics: `referral.link_captured`.
- **Attribution:** `AuthService.signUp()` reads the stored capture and sends `{ referralCode, referralCapturedAt }` to `POST /api/auth/complete-signup`, which resolves `referred_by` via `resolveReferral()` (`web/lib/services/referral-attribution.ts`) — guards: code exists, referrer ≠ new user, capture within 30 days. Any guard failure → `referred_by = null`, signup still succeeds. `referred_by` is immutable post-creation (`profiles_protect_immutable_fields` trigger). Analytics: `referral.attributed` (fired client-side when the route reports a successful match).
- Signup form also shows an optional "Have an invite code?" text input, prefilled from the stored capture — covers word-of-mouth codes without a link.
- **`/account/referral`:** code (copy button + toast), share button (Web Share API, clipboard fallback), invited-count stats card (`GET /api/referral/stats`, service-role count since `profiles` RLS only allows reading your own row), "How it works" bottom sheet.

## Open questions
- Reward model: resolved for web at the decision layer — **1 month of Premium** per referred user with a first confirmed conversion ([plan/README](../plan/README.md)); iOS/Android reward model still open (account credit vs. payout vs. free-month).
- Anti-fraud beyond self-referral + capture expiry (web) / device fingerprint (apps, still open) — full treatment is [T37](../plan/T37-referral-rewards.md).
