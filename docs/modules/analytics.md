# Module: Analytics

**Status:** iOS ◐ · Web ◐ · Android ☐

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md), [subscriptions](../services/subscriptions.md) (gate ≥3M ranges), [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md)
- **Navigates to:** [alerts](alerts.md) ("Set alert at this rate" prefills), [premium](premium.md) (when hitting range gate)
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
- Timeframe chips: 24H, 7D, 30D, 3M, 6M, 1Y (≥3M gated behind Premium — see [subscriptions](../services/subscriptions.md))
- Stats card shows: high, low, average, % change over the selected range
- Line chart spans the full width with axis labels; tap-to-scrub shows value tooltip
- Empty state when historical data unavailable for the pair
- Loading shimmer matches chart shape

## Platform notes
- **iOS**: `WiseRate/Features/Analytics/AnalyticsView.swift` (chart component referenced but not yet implemented — needs Swift Charts)
- **Web**: `web/app/(tabs)/analytics/page.tsx` — chart via Recharts or Visx
- **Android**: `android/.../features/analytics/AnalyticsScreen.kt` — chart via Vico

## Open questions
- Granularity by timeframe (24H = 5min, 1Y = daily?) — pin in [exchange-rate](../services/exchange-rate.md).
