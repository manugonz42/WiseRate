# Module: Analytics

**Status:** iOS ◐ · Web ✅ (all ranges) · Android ☐

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md), [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md)
- **Navigates to:** [alerts](alerts.md) ("Set alert at this rate" prefills)
- **Future:** —

## Used by
- [navigation](../architecture/navigation.md) — tab 3

## Purpose
Historical rate trends for the user's preferred pair — high/low/avg, % change, line chart over selectable timeframes.

## Inputs (data dependencies)
- `AnalyticsViewModel.selectedTimeFrame`, `.historicalRates`, `.rateStats` (computed)
- `ExchangeRateService.getHistorical(from, to, range)` — see [exchange-rate](../services/exchange-rate.md)

## Outputs / Actions
- Change timeframe chip → re-fetch + recompute stats (analytics: `analytics.timeframe_changed`)
- Tap "Set alert at this rate" → open Alerts pre-filled

## Acceptance criteria
- Timeframe chips: 7D, 30D, 3M, 6M, 1Y (all unlocked); 24H only once an intraday source exists ([exchange-rate](../services/exchange-rate.md) known limitations)
- Stats card shows: high, low, average, % change over the selected range
- Line chart spans the full width with axis labels; tap-to-scrub shows value tooltip
- Empty state when historical data unavailable for the pair
- Loading shimmer matches chart shape

## Decision record
**2026-07-09:** Web unlocks all timeframe ranges (3M/6M/1Y). The 3M/6M/1Y lock was a Phase 2 iOS Premium feature backport. Web has no Premium gate (Phase 5+), the data source (Frankfurter/ECB) is free at any range, and `HistoryRange`/`rangeToDateWindow` already support all five ranges. iOS retains its own gating — that's a per-platform decision, revisit in Phase 2.

## Platform notes
- **iOS**: `WiseRate/Features/Analytics/AnalyticsView.swift` (chart component referenced but not yet implemented — needs Swift Charts)
- **Web**: `web/app/(tabs)/analytics/page.tsx` — chart via Recharts (decided, all web charts)
- **Android**: `android/.../features/analytics/AnalyticsScreen.kt` — chart via Vico

## Open questions
- Granularity by timeframe (24H = 5min, 1Y = daily?) — pin in [exchange-rate](../services/exchange-rate.md).
