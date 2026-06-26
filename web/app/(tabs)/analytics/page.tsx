import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export default function AnalyticsPage() {
  return (
    <ModulePlaceholder
      title="Analytics"
      spec="docs/modules/analytics.md"
      criteria={[
        "Timeframe chips 24H/7D/30D/3M/6M/1Y (≥3M gated behind Premium)",
        "Stats card: high, low, average, % change over range",
        "Full-width line chart with axis labels + tap-to-scrub tooltip",
        "Empty state for missing history; loading shimmer matches chart shape",
      ]}
    />
  );
}
