import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { getStoredLocale, setStoredLocale } from "@/lib/services/persistence";
import en from "@/locales/en/common.json";
import es from "@/locales/es/common.json";
import tl from "@/locales/tl/common.json";

export type Locale = "en" | "es" | "tl";

const resources = {
  en: { common: en },
  es: { common: es },
  tl: { common: tl },
};

// Stored locale → browser language → en. Client-only; SSR always resolves en.
export const resolveLocale = (): Locale => {
  if (typeof window === "undefined") return "en";

  const stored = getStoredLocale();
  if (stored === "en" || stored === "es" || stored === "tl") return stored;

  const navLang = navigator.language;
  if (navLang.startsWith("es")) return "es";
  if (navLang === "tl" || navLang.startsWith("fil")) return "tl";

  return "en";
};

// Initialized on server and client with `en` so SSR output and the first
// client render always match; I18nProvider switches to the resolved locale
// after hydration (docs/architecture/localization.md).
if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    initImmediate: false,
  });
}

export function setLocale(code: Locale) {
  if (typeof window === "undefined") return;
  setStoredLocale(code);
  i18next.changeLanguage(code);
}

export default i18next;
