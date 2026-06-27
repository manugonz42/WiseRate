import { STEPS } from "./content";
import { Reveal } from "./Reveal";

// How-it-works (taste-skill §9.C: not 3 equal cards). Card-less flow with
// large index numerals and a connecting hairline; grouped by space, not boxes.
export function HowItWorks() {
  return (
    <section id="how" className="border-y border-border-subtle bg-surface/40 scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-xl py-xxxxl md:px-xxl">
        <Reveal>
          <h2 className="max-w-[24ch] text-title font-extrabold tracking-tight md:text-[40px]">
            From euros to pesos in three moves.
          </h2>
        </Reveal>

        <ol className="mt-xxl grid gap-xl md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <li className="relative md:pr-xl">
                <span className="block text-large-title font-extrabold tabular-nums text-primary/40">
                  {i + 1}
                </span>
                <div className="mt-sm h-px w-full bg-border" />
                <h3 className="mt-md text-title3 font-bold">{step.title}</h3>
                <p className="mt-sm max-w-[40ch] text-footnote text-text-secondary">{step.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
