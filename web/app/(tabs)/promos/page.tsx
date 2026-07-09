"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import { getQuotes } from "@/lib/services/rate";
import { listProviderAccounts } from "@/lib/services/persistence";
import { PROVIDERS } from "@/lib/data/providers";
import ProviderAccounts from "@/components/ProviderAccounts";
import { track } from "@/lib/analytics";

interface Promo {
  kind: "first-transfer" | "referral";
  providerID: string;
  providerName: string;
  providerIcon: string;
  description: string;
  conditions?: string;
  amount: string;
  baseIsStandard?: boolean;
  promoReceiveAmount?: number;
  receiveAmount?: number;
  affiliateURL?: string | null;
  websiteURL?: string;
}

const DEBOUNCE_MS = 150;

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [search, setSearch] = useState("");
  const [accountedProviders, setAccountedProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    const loadPromos = async () => {
      try {
        setLoading(true);
        const response = await getQuotes(1000);
        const allPromos: Promo[] = [];

        // Extract first-transfer promos from quotes
        response.quotes.forEach((quote) => {
          if (quote.isPromotion && quote.promo?.kind === "first-transfer") {
            allPromos.push({
              kind: "first-transfer",
              providerID: quote.providerID,
              providerName: quote.providerName,
              providerIcon: quote.providerIcon,
              description: quote.promo.description,
              conditions: quote.promo.conditions,
              amount: `₱${Math.round(quote.promo.promoReceiveAmount - quote.receiveAmount)}`,
              baseIsStandard: quote.promo.baseIsStandard,
              promoReceiveAmount: quote.promo.promoReceiveAmount,
              receiveAmount: quote.receiveAmount,
              affiliateURL: PROVIDERS[quote.providerID]?.affiliateURL ?? null,
              websiteURL: PROVIDERS[quote.providerID]?.websiteURL,
            });
          }
        });

        // Add referral promos from editorial data
        Object.values(PROVIDERS).forEach((provider) => {
          if (provider.referralPromo) {
            allPromos.push({
              kind: "referral",
              providerID: provider.id,
              providerName: provider.name,
              providerIcon: "", // Will be set from provider lookup
              description: provider.referralPromo.conditions,
              amount: provider.referralPromo.amount,
              affiliateURL: provider.affiliateURL ?? null,
              websiteURL: provider.websiteURL,
            });
          }
        });

        // Deduplicate and ensure provider icons
        const uniquePromos = Array.from(
          new Map(
            allPromos.map((p) => [
              `${p.providerID}-${p.kind}`,
              {
                ...p,
                providerIcon:
                  p.providerIcon ||
                  PROVIDERS[p.providerID]?.id.charAt(0).toUpperCase() ||
                  "?",
              },
            ])
          ).values()
        );

        setPromos(uniquePromos);
        setError(null);
      } catch (err) {
        setError("Failed to load promos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const accounts = listProviderAccounts();
    setAccountedProviders(accounts);
    loadPromos();
  }, []);

  // Debounced search tracking
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (search.trim().length === 0 && debounceTimer) return;

    const timer = setTimeout(() => {
      if (search.trim().length > 0) {
        track("promos.search", { queryLength: search.length });
      }
    }, DEBOUNCE_MS);

    setDebounceTimer(timer);
    return () => clearTimeout(timer);
  }, [search, debounceTimer]);

  // Filter promos by search
  const filtered = useMemo(() => {
    if (!search.trim()) return promos;
    const q = search.toLowerCase();
    return promos.filter((p) => {
      const name = p.providerName.toLowerCase();
      const desc = p.description.toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [promos, search]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-extrabold">Promotions</h1>
        <p className="mt-1 text-sm text-text-secondary">
          All available offers from our partner providers
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search providers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Provider accounts */}
      <ProviderAccounts />

      {/* Promos list */}
      {loading ? (
        <div className="text-center py-8 text-text-secondary">
          Loading promotions...
        </div>
      ) : error ? (
        <div className="rounded-lg bg-warning/15 p-4 text-sm text-warning">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-surface p-8 text-center">
          <p className="text-sm text-text-secondary mb-4">
            {search ? "No promos match your search" : "No promos available"}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-sm font-bold text-primary hover:underline"
            >
              Reset search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((promo) => {
            const hasAccount = accountedProviders.includes(promo.providerID);
            const isDimmed =
              hasAccount && promo.kind === "first-transfer";
            const ctaUrl =
              promo.affiliateURL || promo.websiteURL || "https://sulitsend.app";

            return (
              <div
                key={`${promo.providerID}-${promo.kind}`}
                className={`rounded-lg border border-border bg-surface p-4 transition ${
                  isDimmed ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 shrink-0 rounded bg-text/10 flex items-center justify-center">
                    {promo.providerIcon && promo.providerIcon.length > 1 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={promo.providerIcon}
                        alt={promo.providerName}
                        className="h-10 w-10 rounded"
                      />
                    ) : (
                      <span className="text-sm font-bold">
                        {promo.providerName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold">{promo.providerName}</h3>
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          promo.kind === "first-transfer"
                            ? "bg-success/15 text-success"
                            : "bg-accent/15 text-accent"
                        }`}
                      >
                        {promo.kind === "first-transfer"
                          ? "FIRST TRANSFER"
                          : "REFERRAL"}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">
                      {promo.description}
                    </p>
                    {promo.conditions && (
                      <p className="text-xs text-text-tertiary mb-2">
                        {promo.conditions}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold">
                        {promo.kind === "first-transfer"
                          ? promo.baseIsStandard
                            ? `+${promo.amount} on €1,000`
                            : promo.amount
                          : promo.amount}
                      </span>
                      <a
                        href={ctaUrl}
                        target="_blank"
                        rel="sponsored noopener"
                        onClick={() =>
                          track("promos.affiliate_outbound", {
                            providerID: promo.providerID,
                          })
                        }
                        className="shrink-0 rounded-sm bg-primary px-3 py-1.5 text-xs font-bold text-primary-light hover:bg-primary-dark transition active:scale-[0.98]"
                      >
                        Claim
                      </a>
                    </div>
                    {isDimmed && (
                      <p className="mt-2 text-xs text-text-tertiary">
                        You already have an account &mdash; first-transfer pricing
                        usually won&apos;t apply
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
