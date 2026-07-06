# Module: Home

**Status:** iOS ◐ · Web ✅ · Android ☐

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md), [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md)
- **Navigates to:** [comparison](comparison.md), [provider-details](provider-details.md), [premium](premium.md) (upgrade CTA)
- **Future:** ⏳ [persistence](../services/persistence.md) (remember last amount), ⏳ [subscriptions](../services/subscriptions.md) (hide sponsored slot when Premium)

## Used by
- [navigation](../architecture/navigation.md) — tab 1
- [onboarding](onboarding.md) lands here on complete

## Purpose
Landing screen — current EUR→PHP rate at a glance, top 3 providers ordered by best receive amount, fast jump into Comparison.

## Inputs (data dependencies)
- `HomeViewModel.currentRate`, `.rateChange24h`, `.quotes`, `.sponsoredOffers`
- `ExchangeRateService.getRate()` — see [exchange-rate](../services/exchange-rate.md)
- `TransferProviderService.getQuotes(amount: defaultAmount)`

## Outputs / Actions
- Tap provider card → `providerDetail(providerID)`
- Tap "Compare all" → switch tab to Comparison
- Tap sponsored offer → external affiliate URL (analytics: `home.sponsored_tapped`)
- Pull-to-refresh → re-fetch rate + quotes

## Acceptance criteria
- Shows live mid-market rate with the 24h delta arrow (success/error color from [design-system](../architecture/design-system.md))
- Top 3 providers ordered by `receiveAmount` desc with their effective rate
- Hero rate card shows last-updated timestamp (relative, "2m ago")
- Sponsored slot renders 0–1 offer; never inline-ad spam
- Loading state shows skeleton placeholders, not spinners
- Empty state (no quotes for pair) shows a clear fallback ("we don't yet support EUR→XYZ")

## Platform notes
- **iOS**: `WiseRate/Features/Home/HomeView.swift` (431 lines — split when over 500)
- **Web**: `web/app/(tabs)/home/page.tsx`
- **Android**: `android/app/src/main/java/com/wiserate/features/home/HomeScreen.kt`

## Open questions
- — (default `sendAmount` decided 2026-07: fixed €500; remembering the last amount is the ⏳ persistence dep above)
