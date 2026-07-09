"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { GearSix } from "@phosphor-icons/react/dist/ssr";

export function SettingsButton() {
  const { t } = useTranslation();

  return (
    <Link
      href="/settings"
      className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-surface-hover transition"
      aria-label={t("settings.title")}
    >
      <GearSix size={18} weight="bold" className="text-text-secondary" />
    </Link>
  );
}
