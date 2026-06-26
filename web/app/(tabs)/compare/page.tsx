import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export default function ComparePage() {
  return (
    <ModulePlaceholder
      title="Compare"
      spec="docs/modules/comparison.md"
      criteria={[
        "5 sort options: best rate, lowest fee, fastest, most trusted, cheapest total",
        "Best-deal banner pinned top with savings vs avg",
        "Multi-select delivery-method chips; live provider search (150ms debounce)",
        "Rows: icon, name, fee, delivery estimate, receive amount, markup %, promo badge",
        "Empty filter result with reset action",
      ]}
    />
  );
}
