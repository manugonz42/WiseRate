import { ArrowsLeftRight } from "@phosphor-icons/react/dist/ssr";
import { COMPARED_PROVIDERS } from "@/lib/providers";
import { formatRate } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";

const RATES = [
  65.42, 64.05, 64.8, 64.6, 63.95, 64.3, 65.1, 64.72, 63.8, 64.95,
];

function Pills({ locale }: { locale: Locale }) {
  return (
    <>
      {COMPARED_PROVIDERS.map((name, i) => (
        <span
          key={name}
          className="mx-3 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-medium text-ink-soft"
        >
          <ArrowsLeftRight weight="bold" className="h-3.5 w-3.5 text-accent" />
          {name}
          <span className="tabular font-semibold text-ink">
            {formatRate(RATES[i], locale)} ₱
          </span>
        </span>
      ))}
    </>
  );
}

export function RateTicker({
  caption,
  locale,
}: {
  caption: string;
  locale: Locale;
}) {
  return (
    <section className="border-y border-line bg-surface-tint py-6">
      <p className="mx-auto mb-4 max-w-7xl px-6 text-[13px] text-ink-faint">
        {caption}
      </p>
      <div className="overflow-hidden">
        <div className="marquee-track flex w-max">
          <div className="flex">
            <Pills locale={locale} />
          </div>
          <div className="flex" aria-hidden="true">
            <Pills locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}
