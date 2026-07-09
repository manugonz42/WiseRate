import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/locales/en/common.json";
import es from "@/locales/es/common.json";
import tl from "@/locales/tl/common.json";

const resources = {
  en: { common: en },
  es: { common: es },
  tl: { common: tl },
};

const getInitialLanguage = () => {
  if (typeof window === "undefined") return "en";

  const stored = localStorage.getItem("sulitsend.locale.v1");
  if (stored && ["en", "es", "tl"].includes(stored)) return stored;

  const navLang = navigator.language;
  if (navLang.startsWith("es")) return "es";
  if (navLang === "tl" || navLang.startsWith("fil")) return "tl";

  return "en";
};

if (typeof window !== "undefined" && !i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: "en",
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
  });
}

export function setLocale(code: "en" | "es" | "tl") {
  if (typeof window === "undefined") return;
  localStorage.setItem("sulitsend.locale.v1", code);
  i18next.changeLanguage(code);
}

export default i18next;
