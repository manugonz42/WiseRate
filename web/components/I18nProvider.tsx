"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { resolveLocale } from "@/lib/i18n";

// SSR and the first client render are always `en`; the stored/browser locale
// applies right after hydration so server and client HTML never diverge.
export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const target = resolveLocale();
    if (target !== i18n.language) i18n.changeLanguage(target);
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
