// Single source of truth for site-level identity used by SEO metadata,
// sitemap, robots and structured data. Canonical domain is not provisioned
// yet (see docs/architecture/navigation.md) — base URL is env-driven.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://wiserate.app"
).replace(/\/$/, "");

export const SITE_NAME = "WiseRate";

export const SITE_TAGLINE = "Send euros to the Philippines for less";

export const SITE_DESCRIPTION =
  "Compare the real cost of EUR to PHP transfers across 15+ providers, fees included, so more pesos reach home.";

export const LOCALES = ["en", "es", "tl"] as const;

// hreflang map for metadata.alternates.languages. One canonical per locale;
// the app is single-locale-routed today, so all point at the root.
export const HREFLANG: Record<string, string> = {
  en: `${SITE_URL}/`,
  es: `${SITE_URL}/`,
  tl: `${SITE_URL}/`,
};
