# Module: Provider Details

**Status:** iOS ◐ · Web ◐ · Android ◐

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md), [persistence](../services/persistence.md) (favorites toggle), [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md)
- **Navigates to:** external affiliate URL (system browser), system share sheet
- **Future:** ⏳ [subscriptions](../services/subscriptions.md) (gates historical range > 30D)

## Used by
- [home](home.md) (top-3 provider tap)
- [comparison](comparison.md) (row tap)
- [profile](profile.md) (favorite / recent provider tap)
- [notifications](../services/notifications.md) deep link `wiserate://provider/<id>`

## Purpose
Deep-dive on one provider: trust, fees, delivery methods, pros/cons, historical rate, transfer limits — and the affiliate CTA that earns us revenue.

## Inputs (data dependencies)
- `ProviderDetailViewModel.provider: ProviderDetail`, `.selectedTimeFrame`
- `TransferProviderService.getProvider(id)` → full `ProviderDetail`
- `ExchangeRateService.getHistorical(from, to, range)` — see [exchange-rate](../services/exchange-rate.md)

## Outputs / Actions
- Tap "Send with <Provider>" → opens `affiliateURL ?? websiteURL` (analytics: `provider.affiliate_outbound`)
- Tap favorite icon → toggle in `UserProfile.favoriteProviders` (see [persistence](../services/persistence.md))
- Tap share icon → system share sheet with deep link
- Timeframe selector → re-fetch historical
- Back → previous screen

## Acceptance criteria
- Header: icon, name, brand color background, trust score (X.X / 5), user rating, review count
- Transfer limits row: min and max with currency
- Fee structure section: one row per `FeeStructure`, with delivery method icon
- Delivery methods chips
- Pros / cons two-column or stacked
- Historical rate chart with timeframe chips (24H, 7D, 30D, 3M, 6M, 1Y) — Premium gates >30D
- CTA button is sticky-bottom on mobile, prominent on web

## Platform notes
- **iOS**: `WiseRate/Features/ProviderDetails/ProviderDetailView.swift` (359 lines)
- **Web**: `web/app/provider/[id]/page.tsx`
- **Android**: `android/.../features/providerdetails/ProviderDetailScreen.kt`

## Open questions
- Where do reviews come from? (TrustPilot scrape vs in-app reviews vs blended.)
