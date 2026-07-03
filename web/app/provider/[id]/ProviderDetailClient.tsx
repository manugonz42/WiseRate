"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bank,
  CreditCard,
  DeviceMobile,
  HandCoins,
  House as HomeIcon,
  ArrowLeft,
  ArrowClockwise,
  ArrowSquareOut,
  CheckCircle,
  Lock,
  ShareNetwork,
  Star,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getQuotes } from "@/lib/services/rate";
import { getHistory } from "@/lib/services/history";
import { PROVIDERS, genericProviderDetail } from "@/lib/data/providers";
import { track } from "@/lib/analytics";
import type {
  DeliveryMethod,
  HistoryRange,
  HistoryResponse,
  ProviderDetail,
  QuotesResponse,
} from "@/lib/models/types";

const SEND_AMOUNT = 500;
const RANGES: HistoryRange[] = ["7D", "30D", "3M", "6M", "1Y"];
const LOCKED_RANGES = new Set<HistoryRange>(["3M", "6M", "1Y"]);

const php = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const eur = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const DELIVERY_ICON: Record<DeliveryMethod, typeof Bank> = {
  bankTransfer: Bank,
  cashPickup: HandCoins,
  mobileWallet: DeviceMobile,
  homeDelivery: HomeIcon,
  debitCard: CreditCard,
};

const DELIVERY_LABEL: Record<DeliveryMethod, string> = {
  bankTransfer: "Bank transfer",
  cashPickup: "Cash pickup",
  mobileWallet: "Mobile wallet",
  homeDelivery: "Home delivery",
  debitCard: "Debit card",
};

function brandClasses(color: string): { bg: string; text: string } {
  switch (color) {
    case "success":
      return { bg: "bg-success/15", text: "text-success" };
    case "warning":
      return { bg: "bg-warning/15", text: "text-warning" };
    case "accent":
      return { bg: "bg-accent/15", text: "text-accent" };
    case "primary":
      return { bg: "bg-primary/15", text: "text-primary" };
    default:
      return { bg: "bg-text-tertiary/10", text: "text-text-tertiary" };
  }
}

function formatReviewCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function ProviderDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuotesResponse | null>(null);
  const [quotesLoading, setQuotesLoading] = useState(true);

  const [range, setRange] = useState<HistoryRange>("7D");
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setQuotesLoading(true);
    setError(null);
    getQuotes(SEND_AMOUNT)
      .then((q) => {
        if (!cancelled) setQuotes(q);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the live quote. Try again.");
      })
      .finally(() => {
        if (!cancelled) setQuotesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    let cancelled = false;
    setHistoryLoading(true);
    getHistory(range)
      .then((h) => {
        if (!cancelled) setHistory(h);
      })
      .catch(() => {
        if (!cancelled) setHistory(null);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range, reloadKey]);

  const liveQuote = useMemo(
    () => quotes?.quotes.find((q) => q.providerID === id) ?? null,
    [quotes, id],
  );

  const isKnown = id in PROVIDERS;
  const provider: ProviderDetail = useMemo(
    () => PROVIDERS[id] ?? genericProviderDetail(id, liveQuote?.providerName ?? id),
    [id, liveQuote],
  );
  const brand = brandClasses(provider.brandColor);
  const ctaURL = provider.affiliateURL ?? provider.websiteURL;

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: provider.name, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — nothing more we can do
    }
  };

  return (
    <main className="mx-auto min-h-[100dvh] max-w-4xl px-4 pb-28 pt-6 sm:px-6 md:pb-16">
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
        >
          <ArrowLeft size={16} weight="bold" />
          Back
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-text-secondary transition hover:bg-surface-hover"
        >
          <ShareNetwork size={16} weight="bold" />
          {copied ? "Link copied" : "Share"}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded bg-surface p-8 text-center">
          <p className="mb-4 text-sm text-text-secondary">{error}</p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition active:scale-[0.97]"
          >
            <ArrowClockwise size={14} weight="bold" />
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <span
          className={`flex h-16 w-16 items-center justify-center rounded text-xl font-extrabold ${brand.bg} ${brand.text}`}
          aria-hidden
        >
          {provider.name.slice(0, 2).toUpperCase()}
        </span>
        <h1 className="mt-3 text-[26px] font-extrabold leading-none tracking-tight">
          {provider.name}
        </h1>
        {isKnown ? (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <Star size={14} weight="fill" className="text-warning" />
              {provider.userRating.toFixed(1)} / 5
            </span>
            <span>Trust {(provider.trustScore * 5).toFixed(1)} / 5</span>
            <span>{formatReviewCount(provider.reviewCount)} reviews</span>
          </div>
        ) : null}
        <p className="mt-3 max-w-lg text-sm text-text-secondary">
          {provider.description}
        </p>
      </div>

      {/* Live quote */}
      {!quotesLoading && liveQuote && (
        <div className="mb-6 rounded bg-surface p-5 shadow">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            Current quote for €{SEND_AMOUNT}
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <div className="tabular text-2xl font-extrabold text-success">
              ₱{php.format(liveQuote.receiveAmount)}
            </div>
            <div className="text-sm text-text-secondary">
              fee {eur.format(liveQuote.fee)} · ₱{liveQuote.exchangeRate.toFixed(4)} per €1
            </div>
          </div>
        </div>
      )}
      {quotesLoading && (
        <div className="mb-6 h-[76px] animate-pulse rounded bg-surface" />
      )}
      {!quotesLoading && !liveQuote && !error && (
        <div className="mb-6 rounded bg-surface p-5 text-center text-sm text-text-secondary shadow">
          No live quote available for this provider right now.
        </div>
      )}

      {isKnown && (
        <>
          {/* Transfer limits */}
          <Section title="Transfer limits">
            <div className="flex gap-8">
              <LimitStat label="Minimum" value={`€${provider.transferLimits.minAmount}`} />
              <LimitStat
                label="Maximum"
                value={`€${formatLimit(provider.transferLimits.maxAmount)}`}
              />
            </div>
          </Section>

          {/* Fees */}
          <Section title="Fee structure">
            <ul className="flex flex-col divide-y divide-border-subtle">
              {provider.fees.map((fee, i) => {
                const Icon = DELIVERY_ICON[fee.method];
                return (
                  <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Icon size={20} className="shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{DELIVERY_LABEL[fee.method]}</div>
                      <div className="truncate text-xs text-text-tertiary">
                        {fee.description}
                      </div>
                    </div>
                    <div className="text-right text-sm text-text-secondary">
                      {fee.fixedFee > 0 && <div>{eur.format(fee.fixedFee)}</div>}
                      {fee.percentageFee > 0 && <div>{fee.percentageFee.toFixed(2)}%</div>}
                      {fee.fixedFee === 0 && fee.percentageFee === 0 && <div>Free</div>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>

          {/* Delivery methods */}
          <Section title="Delivery methods">
            <div className="flex flex-wrap gap-2">
              {provider.deliveryMethods.map((m) => {
                const Icon = DELIVERY_ICON[m];
                return (
                  <span
                    key={m}
                    className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-text-primary"
                  >
                    <Icon size={14} className="text-primary" />
                    {DELIVERY_LABEL[m]}
                  </span>
                );
              })}
            </div>
          </Section>

          {/* Pros / cons */}
          <Section title="Pros & cons">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-2 font-semibold text-success">
                  <CheckCircle size={16} weight="fill" />
                  Pros
                </div>
                <ul className="flex flex-col gap-1.5 text-sm text-text-secondary">
                  {provider.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle size={12} weight="fill" className="mt-1 shrink-0 text-success" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 font-semibold text-error">
                  <XCircle size={16} weight="fill" />
                  Cons
                </div>
                <ul className="flex flex-col gap-1.5 text-sm text-text-secondary">
                  {provider.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle size={12} weight="fill" className="mt-1 shrink-0 text-error" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>
        </>
      )}

      {/* Historical rate — mid-market EUR/PHP series (T03), not provider-specific */}
      <Section title="EUR → PHP rate history">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {RANGES.map((r) => {
            const locked = LOCKED_RANGES.has(r);
            const active = range === r;
            return (
              <button
                key={r}
                onClick={() => !locked && setRange(r)}
                title={locked ? "Premium — coming soon" : undefined}
                className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-primary text-white"
                    : locked
                      ? "cursor-not-allowed bg-surface text-text-tertiary"
                      : "bg-surface text-text-secondary hover:bg-surface-hover active:scale-[0.97]"
                }`}
              >
                {locked && <Lock size={10} weight="bold" />}
                {r}
              </button>
            );
          })}
        </div>

        {historyLoading && <div className="h-[220px] animate-pulse rounded-xs bg-surface" />}
        {!historyLoading && history && history.rates.length > 0 && (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={history.rates}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                tickFormatter={(v: string) =>
                  new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                }
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={(v: React.ReactNode) =>
                  new Date(String(v)).toLocaleDateString()
                }
                formatter={(v) => [`₱${Number(v).toFixed(4)}`, "Rate"]}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        {!historyLoading && (!history || history.rates.length === 0) && (
          <div className="flex h-[220px] items-center justify-center text-sm text-text-tertiary">
            No historical data available.
          </div>
        )}
      </Section>

      {/* CTA */}
      {ctaURL && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface p-3 md:static md:mt-8 md:border-0 md:bg-transparent md:p-0">
          <a
            href={ctaURL}
            target="_blank"
            rel="sponsored noopener"
            onClick={() =>
              track("provider.affiliate_outbound", { providerID: provider.id })
            }
            className="flex items-center justify-center gap-2 rounded bg-primary px-4 py-3.5 text-sm font-bold text-white transition active:scale-[0.99]"
          >
            Send with {provider.name}
            <ArrowSquareOut size={16} weight="bold" />
          </a>
          <p className="mt-2 text-center text-[11px] text-text-tertiary">
            We may earn a commission — you pay the same.
          </p>
        </div>
      )}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded bg-surface p-5 shadow">
      <h2 className="mb-4 text-base font-bold">{title}</h2>
      {children}
    </div>
  );
}

function LimitStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
        {label}
      </div>
      <div className="tabular text-lg font-bold">{value}</div>
    </div>
  );
}

function formatLimit(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(value);
}
