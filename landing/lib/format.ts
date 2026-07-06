import type { Locale } from "./i18n/config";

export function formatRate(rate: number, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rate);
}

export function formatEur(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatPhp(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(amount);
}
