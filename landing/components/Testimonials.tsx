import { Quotes } from "@phosphor-icons/react/dist/ssr";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function Testimonials({ dict }: { dict: Dictionary["testimonials"] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {dict.map((q) => (
          <figure
            key={q.name}
            className="rounded-[28px] border border-line bg-surface p-8"
          >
            <Quotes weight="fill" className="h-8 w-8 text-accent-soft" />
            <blockquote className="mt-4 text-lg leading-relaxed text-ink">
              {q.body}
            </blockquote>
            <figcaption className="mt-6 text-[14px]">
              <span className="font-semibold text-ink">{q.name}</span>
              <span className="text-ink-faint"> - {q.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
