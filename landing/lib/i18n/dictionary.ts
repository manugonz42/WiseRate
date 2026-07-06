export type Dictionary = {
  meta: { title: string; description: string };
  nav: { how: string; comparison: string; faq: string; cta: string };
  hero: {
    headlineLine1: string;
    headlineLine2: string;
    subtext: string;
    ctaPrimary: string;
    ctaSecondary: string;
    statValue: string;
    statLabel: string;
    imageAlt: string;
    imageCredit: string;
  };
  ticker: { caption: string };
  how: {
    title: string;
    steps: { title: string; body: string }[];
  };
  comparison: {
    title: string;
    subtitle: string;
    bestBadge: string; // use {provider} as placeholder
    colCompany: string;
    colRate: string;
    colFee: string;
    colArrival: string;
    colRecipient: string;
    arrivalMinutes: string;
    arrivalHours: string;
    cta: string;
  };
  values: {
    title: string;
    cards: { title: string; body: string }[];
  };
  testimonials: { body: string; name: string; role: string }[];
  faq: {
    title: string;
    items: { q: string; a: string }[];
  };
  cta: {
    title: string;
    subtitle: string;
    cta: string;
    imageAlt: string;
    imageCredit: string;
  };
  footer: {
    description: string;
    productLabel: string;
    compareLabel: string;
    corridorLabel: string;
    howLabel: string;
    faqLabel: string;
    languageLabel: string;
    copyright: string;
  };
};
