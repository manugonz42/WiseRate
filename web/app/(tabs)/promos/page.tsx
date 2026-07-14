"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { X } from "@phosphor-icons/react/dist/ssr";
import { getQuotes } from "@/lib/services/rate";
import { listProviderAccounts } from "@/lib/services/persistence";
import { PROVIDERS, providerSendURL } from "@/lib/data/providers";
import { php } from "@/lib/format";
import ProviderAccounts from "@/components/ProviderAccounts";
import { ProviderIcon } from "@/components/ProviderIcon";
import { PromoBadge } from "@/components/PromoBadge";
import { track } from "@/lib/analytics";

// One card per offer. First-transfer promos carry the quote numbers so the
// value line can be derived at render; referral promos carry the editorial
// `amount` string verbatim (docs/modules/promos.md).
interface Promo {
  kind: "first-transfer" | "referral";
  providerID: string;
  providerName: string;
  providerIcon: string;
  description: string;
  conditions?: string;
  baseIsStandard?: boolean;
  promoReceiveAmount?: number;
  receiveAmount?: number;
  amount?: string;
}

const DEBOUNCE_MS = 150;

export default function PromosPage() {
  const { t } = useTranslation();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [search, setSearch] = useState("");
  const [accountedProviders, setAccountedProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
              baseIsStandard: quote.promo.baseIsStandard,
              promoReceiveAmount: quote.promo.promoReceiveAmount,
              receiveAmount: quote.receiveAmount,
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
              providerIcon: "",
              description: provider.referralPromo.conditions,
              amount: provider.referralPromo.amount,
            });
          }
        });

        setPromos(allPromos);
        setError(false);
      } catch (err) {
        setError(true);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    setAccountedProviders(listProviderAccounts());
    loadPromos();
  }, []);

  // Debounced search tracking — timer lives in the effect (same pattern as
  // Compare's search debounce), so each keystroke resets it without state.
  useEffect(() => {
    if (search.trim().length === 0) return;
    const timer = setTimeout(() => {
      track("promos.search", { queryLength: search.length });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

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
        <h1 className="text-2xl font-extrabold">{t("promos.title")}</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {t("promos.subtitle")}
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder={t("promos.searchPlaceholder")}
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

      {/* Provider accounts — toggling re-dims matching cards live */}
      <ProviderAccounts onChange={setAccountedProviders} />

      {/* Promos list */}
      {loading ? (
        <div className="text-center py-8 text-text-secondary">
          {t("promos.loading")}
        </div>
      ) : error ? (
        <div className="rounded-lg bg-warning/15 p-4 text-sm text-warning">
          {t("promos.loadError")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-surface p-8 text-center">
          <p className="text-sm text-text-secondary mb-4">
            {search ? t("promos.noMatch") : t("promos.noPromos")}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-sm font-bold text-primary hover:underline"
            >
              {t("promos.resetSearch")}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((promo) => {
            const hasAccount = accountedProviders.includes(promo.providerID);
            const isDimmed = hasAccount && promo.kind === "first-transfer";
            const ctaUrl = providerSendURL(promo.providerID);

            return (
              <div
                key={`${promo.providerID}-${promo.kind}`}
                className={`rounded-lg border border-border bg-surface p-4 transition ${
                  isDimmed ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <ProviderIcon
                    icon={promo.providerIcon}
                    name={promo.providerName}
                    size={40}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold">{promo.providerName}</h3>
                      <PromoBadge kind={promo.kind} title={promo.conditions} />
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
                        {promo.kind === "referral" ? (
                          promo.amount
                        ) : promo.baseIsStandard ? (
                          t("promos.firstTransferValue", {
                            amount: php.format(
                              (promo.promoReceiveAmount ?? 0) -
                                (promo.receiveAmount ?? 0)
                            ),
                          })
                        ) : (
                          <>
                            ₱{php.format(promo.promoReceiveAmount ?? 0)}{" "}
                            <span className="text-[11px] font-normal text-text-tertiary">
                              {t("promos.promoPriceNote")}
                            </span>
                          </>
                        )}
                      </span>
                      {ctaUrl ? (
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
                          {t("promos.claim")}
                        </a>
                      ) : (
                        <Link
                          href={`/provider/${promo.providerID}`}
                          className="shrink-0 rounded-sm bg-primary px-3 py-1.5 text-xs font-bold text-primary-light hover:bg-primary-dark transition active:scale-[0.98]"
                        >
                          {t("promos.claim")}
                        </Link>
                      )}
                    </div>
                    {isDimmed && (
                      <p className="mt-2 text-xs text-text-tertiary">
                        {t("promos.alreadyAccount")}
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
