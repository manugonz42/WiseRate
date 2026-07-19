"use client";

import { useTranslation } from "react-i18next";
import { Globe } from "@phosphor-icons/react/dist/ssr";
import { setLocale } from "@/lib/i18n";

// compact: globe icon only (header spots) — the native select sits invisible
// on top so tapping the icon still opens the picker.
export function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as "en" | "es" | "tl");
  };

  if (compact) {
    return (
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-hover transition">
        <Globe size={18} weight="bold" className="text-text-secondary" />
        <select
          value={i18n.language}
          onChange={handleChange}
          aria-label={t("settings.language")}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
          <option value="tl">TL</option>
        </select>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1.5 text-xs font-extrabold shadow">
      <Globe size={14} weight="fill" className="text-text-secondary" />
      <select
        value={i18n.language}
        onChange={handleChange}
        className="bg-transparent text-text-primary outline-none cursor-pointer"
      >
        <option value="en">EN</option>
        <option value="es">ES</option>
        <option value="tl">TL</option>
      </select>
    </div>
  );
}
