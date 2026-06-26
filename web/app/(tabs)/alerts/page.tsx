import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export default function AlertsPage() {
  return (
    <ModulePlaceholder
      title="Alerts"
      spec="docs/modules/alerts.md"
      criteria={[
        "Active and triggered alerts in two sections",
        "Create form: target rate, type (above / below / provider cheapest), provider picker",
        "Free users capped at 3 active alerts with Premium upsell",
        "Disabled alerts greyed with toggle; triggered show relative fired-at",
        "Validation: target > 0 and within ±50% of current",
      ]}
    />
  );
}
