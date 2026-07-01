# Module: Comparison

**Status:** iOS ◐ · Web ◐ · Android ☐

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md), [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md)
- **Navigates to:** [provider-details](provider-details.md), external affiliate URL (via system browser)
- **Future:** ⏳ [persistence](../services/persistence.md) (recent searches, last sort preference), ⏳ [subscriptions](../services/subscriptions.md) (ad-free row layout when Premium)

## Used by
- [navigation](../architecture/navigation.md) — tab 2
- [home](home.md) "Compare all" CTA
- Deep link `wiserate://compare?from=&to=&amount=` — see [navigation](../architecture/navigation.md)

## Purpose
Full list of provider quotes for the user-entered amount, sortable and filterable, with a clearly-marked best deal.

## Inputs (data dependencies)
- `ComparisonViewModel.sendAmount`, `.fromCurrency`, `.toCurrency`, `.deliveryMethodFilter`, `.sortOption`, `.searchText`, `.filteredQuotes`
- `TransferProviderService.getQuotes(from, to, amount, methods)`
- `ExchangeRateService.getRate(from, to)` for the markup column

## Outputs / Actions
- Tap provider row → `providerDetail(providerID)`
- Tap "Send" CTA on a row → outbound affiliate URL (analytics: `compare.affiliate_outbound`)
- Sort change → re-orders list (`compare.sort_changed`)
- Change amount / pair → re-fetches quotes

## Acceptance criteria
- Sort options: best rate, lowest fee, fastest, most trusted, cheapest total — exactly 5 ✅ (web)
- Best-deal banner pinned to top showing the winning quote's receive amount + savings vs avg ✅ (web) — amber (`--warning`), matching mobile; the winning row is also highlighted so the emphasis survives scrolling. See [web](../platforms/web.md#desktop-layout-web-is-not-a-phone-screen).
- Desktop (`md+`) renders rows as a table (Provider · Recipient gets · Fee · Speed · Trust); below `md` falls back to stacked cards ✅ (web)
- Filter chips for delivery method are multi-select; "All" toggles the rest off — ⏳ deferred on web: Wise Comparisons API doesn't expose delivery method (see [exchange-rate](../services/exchange-rate.md))
- Search filters provider names live (debounce 150ms) ✅ (web)
- Each row shows: provider icon, name, fee, delivery estimate, receive amount, markup % ✅ (web)
- "Promotional" badge on quotes with `isPromotion = true` — n/a from current source (`isPromotion` always false)
- Empty filter result shows a "no providers match" state with a reset action ✅ (web)

## Platform notes
- **iOS**: `WiseRate/Features/Comparison/ComparisonView.swift`
- **Web**: `web/app/(tabs)/compare/page.tsx`
- **Android**: `android/.../features/comparison/ComparisonScreen.kt`

## Open questions
- Should the amount input live here or in a sticky top bar shared with Home?
