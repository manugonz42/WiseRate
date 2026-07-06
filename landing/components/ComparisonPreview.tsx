import { SAMPLE_COMPARISON } from "@/lib/providers";
import { formatRate, formatEur, formatPhp } from "@/lib/format";
import { APP_URL } from "@/lib/config";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function ComparisonPreview({
  dict,
  locale,
}: {
  dict: Dictionary["comparison"];
  locale: Locale;
}) {
  const best = SAMPLE_COMPARISON.find((r) => r.highlight === "best")!;
  const arrivalLabel = (a: "minutes" | "hours") =>
    a === "minutes" ? dict.arrivalMinutes : dict.arrivalHours;

  return (
    <section id="comparativa" className="bg-surface-tint py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {dict.title}
        </h2>
        <p className="mt-4 max-w-[60ch] leading-relaxed text-ink-soft">
          {dict.subtitle}
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-[13px] font-semibold text-accent-strong">
          {dict.bestBadge.replace("{provider}", best.provider)}
        </div>

        {/* Desktop: real table */}
        <div className="mt-8 hidden overflow-hidden rounded-[24px] border border-line md:block">
          <table className="w-full border-collapse bg-surface text-left">
            <thead>
              <tr className="border-b border-line text-[13px] uppercase tracking-wide text-ink-faint">
                <th className="px-6 py-4 font-medium">{dict.colCompany}</th>
                <th className="px-6 py-4 font-medium">{dict.colRate}</th>
                <th className="px-6 py-4 font-medium">{dict.colFee}</th>
                <th className="px-6 py-4 font-medium">{dict.colArrival}</th>
                <th className="px-6 py-4 font-medium">{dict.colRecipient}</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_COMPARISON.map((row) => (
                <tr
                  key={row.provider}
                  className={`border-b border-line last:border-b-0 ${
                    row.highlight === "best"
                      ? "border-l-4 border-l-accent bg-accent-soft/40"
                      : ""
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-ink">
                    {row.provider}
                  </td>
                  <td className="tabular px-6 py-4 text-ink-soft">
                    {formatRate(row.rate, locale)}
                  </td>
                  <td className="tabular px-6 py-4 text-ink-soft">
                    {formatEur(row.feeEur, locale)}
                  </td>
                  <td className="px-6 py-4 text-ink-soft">
                    {arrivalLabel(row.arrival)}
                  </td>
                  <td className="tabular px-6 py-4 font-semibold text-ink">
                    {formatPhp(row.recipientPhp, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked cards */}
        <div className="mt-8 grid grid-cols-1 gap-3 md:hidden">
          {SAMPLE_COMPARISON.map((row) => (
            <div
              key={row.provider}
              className={`rounded-2xl border border-line bg-surface p-5 ${
                row.highlight === "best" ? "border-l-4 border-l-accent" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{row.provider}</span>
                <span className="tabular font-semibold text-ink">
                  {formatPhp(row.recipientPhp, locale)}
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-[13px] text-ink-faint">
                <span>{formatRate(row.rate, locale)}</span>
                <span>{formatEur(row.feeEur, locale)}</span>
                <span>{arrivalLabel(row.arrival)}</span>
              </div>
            </div>
          ))}
        </div>

        <a
          href={APP_URL}
          className="mt-8 inline-flex items-center rounded-full bg-accent px-7 py-3.5 text-[15px] font-semibold text-accent-on transition-transform active:scale-[0.98]"
        >
          {dict.cta}
        </a>
      </div>
    </section>
  );
}
