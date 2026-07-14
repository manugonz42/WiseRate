"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PROVIDERS } from "@/lib/data/providers";
import {
  listProviderAccounts,
  toggleProviderAccount,
} from "@/lib/services/persistence";
import { track } from "@/lib/analytics";

const SORTED_PROVIDERS = Object.values(PROVIDERS).sort((a, b) =>
  a.name.localeCompare(b.name)
);

type Props = {
  label?: string;
  onChange?: (accounts: string[]) => void;
};

export default function ProviderAccounts({ label, onChange }: Props) {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAccounts(listProviderAccounts());
    setMounted(true);
  }, []);

  const handleToggle = (providerID: string) => {
    const updated = toggleProviderAccount(providerID);
    setAccounts(updated);
    onChange?.(updated);
    track("promos.account_toggled", {
      providerID,
      checked: updated.includes(providerID),
    });
  };

  if (!mounted) return null;

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-bold text-text-secondary">
        {label ?? t("settings.whichProviders")}
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {SORTED_PROVIDERS.map((provider) => (
          <label
            key={provider.id}
            className="flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer hover:bg-surface-hover transition"
          >
            <input
              type="checkbox"
              checked={accounts.includes(provider.id)}
              onChange={() => handleToggle(provider.id)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm font-medium">{provider.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
