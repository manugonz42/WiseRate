"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import ProviderAccounts from "@/components/ProviderAccounts";
import { LanguageSelect } from "@/components/LanguageSelect";
import {
  getDefaultAmount,
  setDefaultAmount,
} from "@/lib/services/persistence";

export default function SettingsPage() {
  const { t } = useTranslation();
  const [defaultAmount, setDefaultAmountState] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getDefaultAmount();
    setDefaultAmountState(stored ? String(stored) : "");
    setMounted(true);
  }, []);

  const handleDefaultAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setDefaultAmountState(value);
    if (value === "" || value === "0") {
      setDefaultAmount(null);
    } else {
      const num = parseInt(value, 10);
      if (!Number.isNaN(num) && num >= 1) {
        setDefaultAmount(num);
      }
    }
  };

  const handleClearData = () => {
    if (
      !window.confirm(
        t("settings.clearDataConfirm") ||
          "Are you sure you want to clear all local data?"
      )
    ) {
      return;
    }
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("sulitsend.")) {
        keys.push(key);
      }
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
    window.location.reload();
  };

  if (!mounted) return null;

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
        <input
          id="defaultAmount"
          type="number"
          value={defaultAmount}
          onChange={handleDefaultAmountChange}
          placeholder="1000"
          className="w-full rounded border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          min="1"
        />
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
        <ProviderAccounts
          label={t("settings.whichProviders") || "Which providers do you already use?"}
        />
      </div>

      {/* Data & privacy */}
      <div className="space-y-3 rounded-lg bg-surface-elevated p-4">
        <div>
          <h2 className="text-sm font-bold text-text-secondary mb-4">
            {t("settings.dataPrivacy")}
          </h2>
          <div className="space-y-2">
            <button
              onClick={handleClearData}
              className="w-full rounded px-4 py-2 bg-surface hover:bg-surface-hover text-text-primary font-medium text-sm transition"
            >
              {t("settings.clearLocalData")}
            </button>
            {/* Placeholder for "Replay intro" (T31) */}
            {/* <button className="w-full rounded px-4 py-2 ...">Replay intro</button> */}
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
