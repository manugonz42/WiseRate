# Module: Referral

**Status:** iOS ◐ · Web ◐ · Android ☐

## Dependencies
- **Reads:** [localization](../architecture/localization.md) (share message), [design-system](../architecture/design-system.md)
- **Navigates to:** system share sheet (external)
- **Future:** ⏳ backend `ReferralService` (codes + stats + payout reconciliation), ⏳ anti-fraud (device fingerprint)

## Used by
- [profile](profile.md) — sheet trigger ("Invite friends")

## Purpose
Show the user their referral code, share it via system share, track earnings.

## Inputs (data dependencies)
- `ReferralViewModel.referralCode`, `.referralCount`, `.referralEarnings`
- `ReferralService.getCode() / .getStats()` — backend, not specced yet

## Outputs / Actions
- Tap "Copy code" → copy to clipboard + toast
- Tap "Share" → system share sheet with prefilled message + deep link `sendrate://?ref=<code>` (analytics: `referral.shared { channel }`)
- Tap "How it works" → bottom sheet with terms

## Acceptance criteria
- Code is uppercase, 6–10 chars (mock: `MARIA2024`)
- Stats card: invited count, earnings (in user's preferred currency)
- Share message localized: en / es / tl
- Earnings credit themselves to either account credit or a payout-when-eligible model — flagged in open questions

## Platform notes
- **iOS**: `SendRate/Features/Referral/ReferralView.swift`
- **Web**: `web/app/(tabs)/profile/referral/page.tsx`
- **Android**: `android/.../features/referral/ReferralScreen.kt`

## Open questions
- Reward model: account credit toward Premium, vs. cash payout via affiliate, vs. one free month per N referrals.
- Anti-fraud: detect self-referrals (same device fingerprint).
