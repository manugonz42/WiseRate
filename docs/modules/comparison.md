# Module: Comparison

**Status:** iOS ◐ · Web ✅ · Android ☐

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md), [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md)
- **Navigates to:** [provider-details](provider-details.md), external affiliate URL (via system browser)
- **Future:** ⏳ [persistence](../services/persistence.md) (recent searches, last sort preference), ⏳ [subscriptions](../services/subscriptions.md) (ad-free row layout when Premium), ⏳ [brokers](brokers.md) (specialist-broker card below the list when amount ≥ €5,000)

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
- Tap "Send" CTA on a row → outbound affiliate URL (analytics: `compare.affiliate_outbound`) ✅ (web: rows with an editorial profile in `web/lib/data/providers.ts`)
- Sort change → re-orders list (`compare.sort_changed`)
- Change amount / pair → re-fetches quotes

## Acceptance criteria
- Sort options: best rate, lowest fee, fastest, most trusted, cheapest total — exactly 5 ✅ (web)
- Best-deal banner pinned to top showing the winning quote's receive amount + savings vs avg ✅ (web) — amber (`--warning`), matching mobile; the winning row is also highlighted so the emphasis survives scrolling. See [web](../platforms/web.md#desktop-layout-web-is-not-a-phone-screen).
- Desktop (`md+`) renders rows as a table (Provider · Recipient gets · Fee · Speed · Trust); below `md` falls back to stacked cards ✅ (web)
- Delivery-method selector (single-select: All / Bank transfer / Cash pickup / Mobile wallet); changing it re-fetches with `method=` ✅ (web). When a specific method is selected the list shows **only providers that offer it** — Western Union + TransferGo re-price per method, so a non-bank method narrows the list to sources that actually support it; the rest carry only a bank-transfer quote and drop out. Best-deal banner and average are computed over the method-matching set. See [exchange-rate](../services/exchange-rate.md#delivery-method-support-per-source). Multi-select "All toggles the rest off" simplified to single-select on web.
- Search filters provider names live (debounce 150ms) ✅ (web)
- Each row shows: provider icon, name, fee, delivery estimate, receive amount, markup % ✅ (web)
- "Promo" badge on quotes with `isPromotion = true`, showing the first-transfer price next to the standard one (`PromoInfo`); when the provider publishes no standard price (`baseIsStandard = false`) the row says so ✅ (web)
- Promo badge is labeled by kind — "FIRST TRANSFER" (provider's own new-customer pricing, `PromoInfo.kind`) vs. "VIA OUR LINK: {amount}" (our affiliate referral bonus, editorial `providers.ts` `referralPromo`) — both shown together when both exist, no per-user eligibility yet ✅ (web, T22); referral data stays empty until a real affiliate deal is signed
- Quotes not fetched from the provider's own endpoint carry a source tag: "via Wise" (`wise-comparisons`) or "mock" ✅ (web); banks with no referral/affiliate program are dropped entirely rather than tagged (T22 bank audit, see [exchange-rate](../services/exchange-rate.md))
- Empty filter result shows a reset state ✅ (web): "no providers match" + reset-search when a search yields nothing, or "no providers offer this method yet" + show-all-methods when the method filter empties the list
- Amount field can be fully cleared; blur on empty resets to €100 ✅ (web)

## Platform notes
- **iOS**: `WiseRate/Features/Comparison/ComparisonView.swift`
- **Web**: `web/app/(tabs)/compare/page.tsx`
- **Android**: `android/.../features/comparison/ComparisonScreen.kt`

## Open questions
- Should the amount input live here or in a sticky top bar shared with Home?
