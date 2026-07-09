"use client";

import { useTranslation } from "react-i18next";
import { Globe } from "@phosphor-icons/react/dist/ssr";
import { setLocale } from "@/lib/i18n";

export function LanguageSelect() {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as "en" | "es" | "tl");
  };

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
