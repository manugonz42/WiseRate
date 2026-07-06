import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { RateTicker } from "@/components/RateTicker";
import { HowItWorks } from "@/components/HowItWorks";
import { ComparisonPreview } from "@/components/ComparisonPreview";
import { ValueProps } from "@/components/ValueProps";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  const dict = getDictionary(locale);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SulitSend",
    url: SITE_URL,
    logo: `${SITE_URL}/opengraph-image`,
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SulitSend",
    url: SITE_URL,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Nav dict={dict.nav} locale={locale} />
      <main>
        <Hero dict={dict.hero} />
        <RateTicker caption={dict.ticker.caption} locale={locale} />
        <HowItWorks dict={dict.how} />
        <ComparisonPreview dict={dict.comparison} locale={locale} />
        <ValueProps dict={dict.values} />
        <Testimonials dict={dict.testimonials} />
        <FAQ dict={dict.faq} />
        <FinalCTA dict={dict.cta} />
      </main>
      <Footer dict={dict.footer} locale={locale} />
    </>
  );
}
