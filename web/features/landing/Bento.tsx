import { Bell, Lightning, Receipt } from "@phosphor-icons/react/dist/ssr";
import { generateHistoricalRates } from "@/lib/services/mockData";
import { Sparkline } from "@/components/Sparkline";
import { Reveal } from "./Reveal";

// Why-WiseRate bento (taste-skill §4.7): asymmetric tile sizes, exact cell
// count (4 items, 4 cells), at least two cells with real visual variation
// (live sparkline, gradient + icon compositions).
export function Bento() {
  const history = generateHistoricalRates("30D");

  return (
    <section className="mx-auto w-full max-w-6xl px-xl py-xxxxl md:px-xxl">
      <Reveal>
        <h2 className="max-w-[20ch] text-title font-extrabold tracking-tight md:text-[40px]">
          One place to send smarter.
        </h2>
        <p className="mt-md max-w-[52ch] text-body text-text-secondary">
          Every quote ranked by what actually arrives, with the tools to send at the right time.
        </p>
      </Reveal>

      <div className="mt-xl grid gap-md md:grid-cols-3">
        <Reveal className="md:col-span-2">
          <article className="flex h-full flex-col justify-between rounded border border-border bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(20,20,20,0.2))] p-xl">
            <div>
              <h3 className="text-title3 font-bold">The real amount received</h3>
              <p className="mt-sm max-w-[44ch] text-footnote text-text-secondary">
                We fold each provider's fee into its rate, then rank by pesos delivered. No
                headline number that falls apart at checkout.
              </p>
            </div>
            <div className="mt-lg">
              <Sparkline data={history} />
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.05}>
          <article className="flex h-full flex-col gap-md rounded border border-border bg-surface p-xl">
            <Bell size={28} weight="duotone" className="text-primary-light" />
            <h3 className="text-title3 font-bold">Rate alerts</h3>
            <p className="text-footnote text-text-secondary">
              Pick a target rate. We ping you when EUR to PHP crosses it.
            </p>
          </article>
        </Reveal>

        <Reveal>
          <article className="flex h-full flex-col gap-md rounded border border-border bg-surface p-xl">
            <Receipt size={28} weight="duotone" className="text-primary-light" />
            <h3 className="text-title3 font-bold">Fees included</h3>
            <p className="text-footnote text-text-secondary">
              Fixed fees and exchange markup, counted in every comparison.
            </p>
          </article>
        </Reveal>

        <Reveal delay={0.05} className="md:col-span-2">
          <article className="flex h-full flex-col justify-between gap-lg rounded border border-border bg-[linear-gradient(135deg,rgba(52,211,153,0.12),rgba(20,20,20,0.2))] p-xl sm:flex-row sm:items-center">
            <div>
              <Lightning size={28} weight="duotone" className="text-accent" />
              <h3 className="mt-md text-title3 font-bold">Delivery speed, side by side</h3>
              <p className="mt-sm max-w-[40ch] text-footnote text-text-secondary">
                Instant, hours or next day. Trade a little rate for speed when it matters.
              </p>
            </div>
            <div className="flex shrink-0 gap-sm">
              {["Instant", "Hours", "Next day"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-border bg-surface-elevated px-md py-xs text-caption font-medium text-text-secondary"
                >
                  {label}
                </span>
              ))}
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
