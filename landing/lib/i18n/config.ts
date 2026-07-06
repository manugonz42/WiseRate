// Locale set and priority follow docs/architecture/localization.md.
export const locales = ["en", "es", "tl"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  tl: "Tagalog",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
