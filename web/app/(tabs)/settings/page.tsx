"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import ProviderAccounts from "@/components/ProviderAccounts";
import { LanguageSelect } from "@/components/LanguageSelect";
import { DefaultAmountField } from "@/components/DefaultAmountField";
import { clearAll, clearOnboarded } from "@/lib/services/persistence";

export default function SettingsPage() {
  const { t } = useTranslation();

  const handleReplayIntro = () => {
    clearOnboarded();
    window.location.reload();
  };

  const handleClearData = () => {
    if (!window.confirm(t("settings.clearDataConfirm"))) {
      return;
    }
    clearAll();
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6 lg:px-0">
      <div>
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
      </div>

      {/* Language */}
      <div className="space-y-3 rounded-lg bg-surface-elevated p-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-text-secondary">
            {t("settings.language")}
          </label>
          <LanguageSelect />
        </div>
      </div>

      {/* Default send amount */}
      <div className="space-y-3 rounded-lg bg-surface-elevated p-4">
        <div>
          <label
            htmlFor="defaultAmount"
            className="text-sm font-bold text-text-secondary"
          >
            {t("settings.defaultAmount")}
          </label>
          <p className="text-xs text-text-tertiary mt-1">
            {t("settings.defaultAmountDesc")}
          </p>
        </div>
        <DefaultAmountField id="defaultAmount" />
      </div>

      {/* Your provider accounts */}
      <div className="space-y-3 rounded-lg bg-surface-elevated p-4">
        <div>
          <p className="text-sm font-bold text-text-secondary mb-3">
            {t("settings.providerAccounts")}
          </p>
          <p className="text-xs text-text-tertiary mb-4">
            {t("settings.providerAccountsDesc")}{" "}
            <Link href="/promos" className="text-primary hover:underline">
              {t("settings.promos")}
            </Link>
          </p>
        </div>
        <ProviderAccounts />
      </div>

      {/* Data & privacy */}
      <div className="space-y-3 rounded-lg bg-surface-elevated p-4">
        <div>
          <h2 className="text-sm font-bold text-text-secondary mb-4">
            {t("settings.dataPrivacy")}
          </h2>
          <div className="space-y-2">
            <button
              onClick={handleReplayIntro}
              className="w-full rounded px-4 py-2 bg-surface hover:bg-surface-hover text-text-primary font-medium text-sm transition"
            >
              {t("settings.replayIntro")}
            </button>
            <button
              onClick={handleClearData}
              className="w-full rounded px-4 py-2 bg-surface hover:bg-surface-hover text-text-primary font-medium text-sm transition"
            >
              {t("settings.clearLocalData")}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs pt-3 border-t border-border">
          <Link href="/privacy" className="text-primary hover:underline">
            {t("footer.privacy")}
          </Link>
          <span className="text-text-tertiary">·</span>
          <Link href="/cookies" className="text-primary hover:underline">
            {t("footer.cookies")}
          </Link>
          <span className="text-text-tertiary">·</span>
          <Link href="/terms" className="text-primary hover:underline">
            {t("footer.terms")}
          </Link>
        </div>
      </div>
    </div>
  );
}
