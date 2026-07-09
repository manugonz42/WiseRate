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
Landing screen — pick a send amount, see what your family receives with the best provider, top 3 as a podium, fast jump into Comparison. Pistacho direction: the screen celebrates the best deal (podium, count-up, "extra vs average") instead of listing rates flatly.

Web `lg+` (desktop) swaps the podium layout for a dashboard: the layout's dark sidebar slot carries the amount chips, hero count-up, Send CTA and savings ring; the main pane is a "Live ranking" table. Below `lg` the podium design is unchanged. Same data, same state — CSS breakpoint only.

## Inputs (data dependencies)
- `HomeViewModel.currentRate`, `.rateChange24h`, `.quotes`, `.sponsoredOffers`
- `ExchangeRateService.getRate()` — see [exchange-rate](../services/exchange-rate.md)
- `TransferProviderService.getQuotes(amount)` — amount from the preset chips
- 7D history (for the "% of 7-day high" meter) — degrades gracefully when unavailable

## Outputs / Actions
- Amount chips (€100 / €200 / €500 / €1000, default €200) → re-fetch quotes; hero number tweens
- Tap podium column / ranked row → `providerDetail(providerID)`
- "Send with {best}" CTA → affiliate/website URL (analytics: `home.affiliate_outbound`), falls back to provider detail
- "See the full ranking (N)" → switch tab to Comparison
- Tap sponsored offer → external affiliate URL (analytics: `home.sponsored_tapped`)
- Pull-to-refresh → re-fetch rate + quotes

## Acceptance criteria
- Hero shows receive amount for the best provider at the selected chip amount, with count-up on change
- Rate line: mid-market rate + last-updated timestamp (relative, "2m ago") + day-over-day delta arrow (success/error color from [design-system](../architecture/design-system.md))
- Ink savings card: best-vs-average extra ₱ + ring meter of today's rate within the 7D range (hidden if history unavailable)
- Podium: top 3 by `receiveAmount` desc (order 2-1-3, winner center with crown + "+₱X EXTRA" badge). Each column shows: receive amount, medal + provider name (🥇/🥈/🥉), fee line (`€0 fee` or formatted fee). Ranks 4–5 as compact rows; non-`direct` quotes keep their source attribution
- Fewer than 3 quotes → plain ranked rows, no podium
- Sponsored slot renders 0–1 offer; never inline-ad spam
- Loading state shows skeleton placeholders, not spinners; amount switches keep stale data visible (dimmed) instead of re-skeletoning
- Empty state (no quotes for pair) shows a clear fallback ("we don't yet support EUR→XYZ")
- **Web `lg+` desktop:** sidebar slot = amount chips + "your family gets up to" count-up + rate line + Send CTA + savings ring ("+₱X vs average"); main pane = "Live ranking" panel — header (provider count · €amount → PHP, "best beats average by ₱X" badge) + table (# / provider / fee / speed / you get), winner row lime with "+₱X vs average" subline, ⚡ on ≤60-min delivery, top 5 rows + "See all N →" into Comparison + commission disclosure

## Platform notes
- **iOS**: `WiseRate/Features/Home/HomeView.swift` (431 lines — split when over 500)
- **Web**: `web/app/(tabs)/home/page.tsx`; desktop sidebar content injected into the layout via the `web/components/SidebarSlot.tsx` portal
- **Android**: `android/app/src/main/java/com/wiserate/features/home/HomeScreen.kt`

## Open questions
- — (default `sendAmount` decided 2026-07: chip presets 100/200/500/1000 with €200 selected; remembering the last amount is the ⏳ persistence dep above)
