import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, HREFLANG } from "@/lib/site";
import { FAQS } from "@/features/landing/content";
import { Hero } from "@/features/landing/Hero";
import { LogoWall } from "@/features/landing/LogoWall";
import { Bento } from "@/features/landing/Bento";
import { HowItWorks } from "@/features/landing/HowItWorks";
import { SocialProof } from "@/features/landing/SocialProof";
import { Faq } from "@/features/landing/Faq";
import { Reveal } from "@/features/landing/Reveal";

export const metadata: Metadata = {
  title: `Compare EUR to PHP transfer rates · ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/", languages: HREFLANG },
  openGraph: {
    title: `${SITE_NAME} · Compare EUR to PHP transfer rates`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
  },
};

// JSON-LD: Organization + Service (the comparison) + FAQPage. Source shared
// with the visible FAQ so structured data never drifts (taste/seo).
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "Service",
      name: "EUR to PHP transfer rate comparison",
      provider: { "@id": `${SITE_URL}/#org` },
      areaServed: ["ES", "PH"],
      serviceType: "Money transfer comparison",
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNav />
      <main>
        <Hero />
        <LogoWall />
        <Bento />
        <HowItWorks />
        <SocialProof />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

function LandingNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-xl md:px-xxl">
        <Link href="/" className="text-title3 font-extrabold tracking-tight">
          {SITE_NAME}
        </Link>
        <Link
          href="/home"
          className="inline-flex items-center gap-sm rounded-full bg-primary px-lg py-sm text-subhead font-semibold text-on-primary transition-transform duration-quick ease-standard hover:bg-primary-dark active:scale-[0.98]"
        >
          Compare rates
          <ArrowRight size={16} weight="bold" />
        </Link>
      </nav>
    </header>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-xl pb-xxxxl md:px-xxl">
      <Reveal>
        <div className="relative overflow-hidden rounded border border-border bg-[linear-gradient(135deg,var(--primary-dark),var(--primary))] px-xl py-xxxxl text-center">
          <h2 className="mx-auto max-w-[20ch] text-title font-extrabold tracking-tight md:text-[40px]">
            Stop guessing the exchange rate.
          </h2>
          <p className="mx-auto mt-md max-w-[44ch] text-callout text-[rgba(255,255,255,0.85)]">
            See what every provider really pays out, then send with the best one.
          </p>
          <Link
            href="/home"
            className="mt-xl inline-flex items-center gap-sm rounded-sm bg-text-primary px-xl py-md text-headline font-semibold text-primary-dark transition-transform duration-quick ease-standard hover:opacity-90 active:scale-[0.98]"
          >
            Compare rates
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-lg px-xl py-xl md:flex-row md:items-center md:justify-between md:px-xxl">
        <span className="text-headline font-extrabold tracking-tight">{SITE_NAME}</span>
        <nav className="flex flex-wrap gap-x-xl gap-y-sm text-footnote text-text-secondary">
          <Link href="/home" className="hover:text-text-primary">Home</Link>
          <Link href="/compare" className="hover:text-text-primary">Compare</Link>
          <Link href="/analytics" className="hover:text-text-primary">Analytics</Link>
          <Link href="/alerts" className="hover:text-text-primary">Alerts</Link>
        </nav>
        <span className="text-caption text-text-tertiary">
          Comparison is free. We may earn a referral fee.
        </span>
      </div>
    </footer>
  );
}
