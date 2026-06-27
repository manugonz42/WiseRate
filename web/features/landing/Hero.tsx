import Link from "next/link";
import { ArrowDown } from "@phosphor-icons/react/dist/ssr";
import { SITE_TAGLINE } from "@/lib/site";
import { Reveal } from "./Reveal";
import { LiveQuoteWidget } from "./LiveQuoteWidget";

// Asymmetric split hero (taste-skill §10): value prop left, real quote widget
// right. Primary CTA ("Compare rates") lives inside the widget; the hero keeps
// one secondary link. min-h not h-screen; top padding capped.
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,var(--primary)_0%,transparent_70%)] opacity-25 blur-2xl"
      />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-xxxl px-xl pb-xxxxl pt-xxxl md:grid-cols-2 md:px-xxl md:pt-24">
        <Reveal>
          <p className="text-caption font-semibold uppercase tracking-[0.18em] text-primary-light">
            EUR to PHP
          </p>
          <h1 className="mt-md text-[40px] font-extrabold leading-[1.05] tracking-tight md:text-[56px]">
            {SITE_TAGLINE}.
          </h1>
          <p className="mt-lg max-w-[48ch] text-body text-text-secondary">
            WiseRate compares the real cost across 15+ transfer providers, fees included, so
            more pesos reach home.
          </p>
          <div className="mt-xl flex items-center gap-lg">
            <Link
              href="#how"
              className="flex items-center gap-sm text-headline font-semibold text-text-primary transition-colors duration-quick ease-standard hover:text-primary-light"
            >
              How it works
              <ArrowDown size={18} weight="bold" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <LiveQuoteWidget />
        </Reveal>
      </div>
    </section>
  );
}
