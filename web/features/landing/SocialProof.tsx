import { generateHistoricalRates } from "@/lib/services/mockData";
import { formatRate } from "@/lib/format";
import { Sparkline } from "@/components/Sparkline";
import { TESTIMONIALS } from "./content";
import { Reveal } from "./Reveal";

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

// Split-layout social proof: live rate panel left, two short testimonials
// right (taste-skill §4.10: <=3 lines, real attribution, locale-appropriate
// names). A distinct layout family from the bento and the step flow.
export function SocialProof() {
  const history = generateHistoricalRates("90D");
  const current = history[history.length - 1]?.rate ?? 63.5;

  return (
    <section className="mx-auto w-full max-w-6xl px-xl py-xxxxl md:px-xxl">
      <div className="grid gap-xl md:grid-cols-2">
        <Reveal>
          <div className="flex h-full flex-col justify-between rounded border border-border bg-surface p-xl">
            <div>
              <div className="text-footnote text-text-secondary">EUR to PHP, last 90 days</div>
              <div className="mt-xs text-large-title font-extrabold tabular-nums">
                ₱{formatRate(current)}
                <span className="ml-sm text-subhead font-medium text-text-tertiary">per €1</span>
              </div>
            </div>
            <div className="mt-lg">
              <Sparkline data={history} />
            </div>
          </div>
        </Reveal>

        <div className="flex flex-col gap-md">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <figure className="rounded border border-border bg-surface p-xl">
                <blockquote className="text-callout leading-relaxed text-text-primary">
                  {"“"}
                  {t.quote}
                  {"”"}
                </blockquote>
                <figcaption className="mt-lg flex items-center gap-md">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(16,185,129,0.2)] text-caption font-bold text-primary-light"
                  >
                    {initials(t.name)}
                  </span>
                  <span className="text-footnote">
                    <span className="font-semibold text-text-primary">{t.name}</span>
                    <span className="block text-text-tertiary">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
