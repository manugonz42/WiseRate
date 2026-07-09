"use client";

import { useEffect, useState } from "react";
import { PROVIDERS } from "@/lib/data/providers";
import {
  listProviderAccounts,
  toggleProviderAccount,
} from "@/lib/services/persistence";
import { track } from "@/lib/analytics";

type Props = {
  label?: string;
};

export default function ProviderAccounts({ label = "Which providers do you already use?" }: Props) {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAccounts(listProviderAccounts());
    setMounted(true);
  }, []);

  const handleToggle = (providerID: string) => {
    const updated = toggleProviderAccount(providerID);
    setAccounts(updated);
    track("promos.account_toggled", {
      providerID,
      checked: updated.includes(providerID),
    });
  };

  if (!mounted) return null;

  const sortedProviders = Object.values(PROVIDERS).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-bold text-text-secondary">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {sortedProviders.map((provider) => (
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
