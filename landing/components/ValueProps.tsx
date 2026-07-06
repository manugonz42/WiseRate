import { Eye, Wallet, ArrowsClockwise, Translate } from "@phosphor-icons/react/dist/ssr";
import type { Dictionary } from "@/lib/i18n/dictionary";

const ICONS = [Eye, Wallet, ArrowsClockwise, Translate];

export function ValueProps({ dict }: { dict: Dictionary["values"] }) {
  const [card1, card2, card3, card4] = dict.cards;
  const Icon1 = ICONS[0];
  const Icon2 = ICONS[1];
  const Icon3 = ICONS[2];
  const Icon4 = ICONS[3];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        {dict.title}
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-[28px] bg-gradient-to-br from-accent to-accent-strong p-8 text-accent-on md:col-span-2">
          <Icon1 weight="bold" className="h-8 w-8" />
          <h3 className="mt-5 font-display text-xl font-semibold">
            {card1.title}
          </h3>
          <p className="mt-2 max-w-[42ch] leading-relaxed opacity-90">
            {card1.body}
          </p>
        </div>

        <div className="rounded-[28px] border border-line bg-surface p-8">
          <Icon2 weight="bold" className="h-8 w-8 text-accent" />
          <h3 className="mt-5 font-display text-lg font-semibold text-ink">
            {card2.title}
          </h3>
          <p className="mt-2 leading-relaxed text-ink-soft">{card2.body}</p>
        </div>

        <div className="rounded-[28px] border border-line bg-surface p-8">
          <Icon3 weight="bold" className="h-8 w-8 text-accent" />
          <h3 className="mt-5 font-display text-lg font-semibold text-ink">
            {card3.title}
          </h3>
          <p className="mt-2 leading-relaxed text-ink-soft">{card3.body}</p>
        </div>

        <div className="flex flex-col gap-5 rounded-[28px] bg-surface-tint p-8 md:col-span-4 md:flex-row md:items-center">
          <Icon4 weight="bold" className="h-8 w-8 shrink-0 text-accent" />
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">
              {card4.title}
            </h3>
            <p className="mt-2 max-w-[52ch] leading-relaxed text-ink-soft">
              {card4.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
