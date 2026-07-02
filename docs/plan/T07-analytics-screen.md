# T07 — Analytics screen (web)

## Dependencies
- **Reads:** [analytics module](../modules/analytics.md) (acceptance — binding), [exchange-rate](../services/exchange-rate.md) (24H limitation)
- **Task deps:** T03 (history API); T06 optional (prefill link target)

## Used by
- Tab 3; "Set alert at this rate" feeds Alerts

## Goal
Historical trends at `web/app/(tabs)/analytics/page.tsx`: stats card + line chart over selectable ranges.

## Pre-made decisions
- Chart: **Recharts** (already installed by T05; if running before T05, `npm i recharts`).
- Chips: 7D · 30D · 3M · 6M · 1Y. **No 24H** (T03). **3M/6M/1Y render locked** ("Premium — coming soon", inert) per the spec's Premium gate — functional ranges today: 7D, 30D.
- Tap-to-scrub = Recharts `<Tooltip>` (cursor + value/date readout) — that satisfies the criterion on web.
- "Set alert at this rate" → `router.push("/alerts?rate=<current mid-market>")`.
- Stats over the selected range: high, low, average (2 decimals), % change first→last (signed, success/error color).

## Steps
1. Build the page (client component): fetch `getHistory(range)` on chip change; compute stats from the returned series (pure helper + vitest for it).
2. Chart: full-width line, date x-axis (sparse ticks), rate y-axis (domain padded ±0.5%), tooltip as above.
3. States per spec: loading shimmer matching the chart's shape; empty state when the API errors ("Historical data unavailable").
4. Fire `console.info("analytics: analytics.timeframe_changed", { range })` on chip change (T10 replaces).
5. Enable the Analytics tab in `web/app/(tabs)/layout.tsx`.
6. Update [MODULES.md](../MODULES.md) Analytics/Web ◐ (7D/30D live; ≥3M gated). Check off T07.

## Verify
`/analytics`: 7D↔30D switch refetches and stats update; locked chips inert; tooltip scrubs; "Set alert" lands on Alerts prefilled. `npm test && npm run build && npm run lint`.

## Out of scope
Intraday data, Premium unlock, multiple currency pairs (EUR→PHP only), dataviz beyond the single line chart.
