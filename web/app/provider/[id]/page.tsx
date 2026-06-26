import Link from "next/link";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

// Pushed route: sendrate://provider/<id>. Next 16 — params is a Promise.
export default async function ProviderDetailPage({
  params,
}: PageProps<"/provider/[id]">) {
  const { id } = await params;
  return (
    <main className="pb-[var(--space-xxxl)]">
      <ModulePlaceholder
        title={`Provider · ${id}`}
        spec="docs/modules/provider-details.md"
        criteria={[
          "Header: icon, name, brand-color bg, trust score (X.X/5), rating, review count",
          "Transfer limits (min/max), fee structure rows, delivery-method chips",
          "Pros / cons; historical chart with timeframe chips (>30D Premium-gated)",
          "Sticky-bottom CTA on mobile",
        ]}
      />
      <div className="px-[var(--space-xl)] pt-[var(--space-lg)]">
        <Link href="/compare" className="text-[15px] text-primary">
          ← Back to Compare
        </Link>
      </div>
    </main>
  );
}
