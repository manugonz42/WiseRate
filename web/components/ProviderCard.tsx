import type { TransferQuote } from "@/lib/models";
import { DELIVERY_LABEL } from "@/lib/models";
import { formatPHP } from "@/lib/format";
import { BrandAvatar } from "@/components/BrandAvatar";

interface ProviderCardProps {
  quote: TransferQuote;
  rank?: number;
  onClick?: () => void;
}

export function ProviderCard({ quote, rank, onClick }: ProviderCardProps) {
  return (
    <button
      onClick={onClick}
      className="min-w-[200px] shrink-0 rounded border border-border bg-surface-elevated p-lg text-left transition-colors duration-quick ease-standard hover:bg-surface-hover"
    >
      <div className="flex items-center justify-between">
        <BrandAvatar icon={quote.providerIcon} color={quote.brandColor} />
        {rank != null && (
          <span className="text-caption font-semibold text-text-tertiary">#{rank}</span>
        )}
      </div>
      <div className="mt-md text-callout font-semibold">{quote.providerName}</div>
      <div className="mt-xs text-headline font-bold text-success tabular-nums">
        {formatPHP(quote.receiveAmount)}
      </div>
      <div className="mt-xs flex items-center justify-between text-caption text-text-secondary">
        <span>{quote.exchangeRate.toFixed(2)} ₱/€</span>
        <span>{DELIVERY_LABEL[quote.deliveryEstimate]}</span>
      </div>
    </button>
  );
}
