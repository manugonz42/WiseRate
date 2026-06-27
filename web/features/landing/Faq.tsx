import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { FAQS } from "./content";
import { Reveal } from "./Reveal";

// FAQ accordion via native <details> (no client JS, keyboard-accessible). Same
// source as the FAQPage JSON-LD in page.tsx. Caret rotation lives in globals.css.
export function Faq() {
  return (
    <section className="mx-auto w-full max-w-3xl px-xl py-xxxxl md:px-xxl">
      <Reveal>
        <h2 className="text-title font-extrabold tracking-tight md:text-[40px]">
          Questions, answered.
        </h2>
      </Reveal>
      <div className="mt-xl divide-y divide-border border-y border-border">
        {FAQS.map((faq) => (
          <details key={faq.q} className="group py-lg">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-lg text-headline font-semibold">
              {faq.q}
              <CaretDown
                size={18}
                weight="bold"
                className="faq-caret shrink-0 text-text-tertiary transition-transform duration-quick ease-standard"
              />
            </summary>
            <p className="mt-md max-w-[60ch] text-callout leading-relaxed text-text-secondary">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
