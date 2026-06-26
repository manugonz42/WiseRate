import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export default function HomePage() {
  return (
    <ModulePlaceholder
      title="Home"
      spec="docs/modules/home.md"
      criteria={[
        "Live mid-market rate with 24h delta arrow (success/error color)",
        "Hero rate card with relative last-updated timestamp",
        "Top 3 providers ordered by receiveAmount desc + effective rate",
        "Sponsored slot (0–1 offer), skeleton loading, empty-pair fallback",
      ]}
    />
  );
}
