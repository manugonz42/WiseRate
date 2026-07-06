"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getQuotes } from "@/lib/services/rate";
import { getHistory } from "@/lib/services/history";
import type {
  HistoryResponse,
  QuotesResponse,
  TransferQuote,
} from "@/lib/models/types";
import { ArrowClockwise, ArrowDown, ArrowUp } from "@phosphor-icons/react/dist/ssr";

const SEND_AMOUNT = 500;

const php = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

// "2m ago" / "3h ago" — computed at render time, no ticking interval (T04 scope).
function relativeTime(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function HomePage() {
  const [quotes, setQuotes] = useState<QuotesResponse | null>(null);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        // History is a nice-to-have (24h delta) — don't fail the whole page for it.
        const [q, h] = await Promise.all([
          getQuotes(SEND_AMOUNT),
          getHistory("7D").catch(() => null),
        ]);
        if (!cancelled) {
          setQuotes(q);
          setHistory(h);
        }
      } catch {
        if (!cancelled) setError("Couldn't load rates. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const topThree = useMemo(() => {
    if (!quotes) return [];
    return [...quotes.quotes]
      .sort((a, b) => b.receiveAmount - a.receiveAmount)
      .slice(0, 3);
  }, [quotes]);

  // Last two points of the 7D series — day-over-day, never framed as intraday.
  const delta = useMemo(() => {
    if (!history || history.rates.length < 2) return null;
    const [prev, latest] = history.rates.slice(-2);
    if (!prev || !latest || prev.rate === 0) return null;
    return {
      value: latest.rate - prev.rate,
      pct: ((latest.rate - prev.rate) / prev.rate) * 100,
    };
  }, [history]);

  return (
    <main className="mx-auto min-h-[100dvh] max-w-4xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-5">
        <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
          Home
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          EUR → PHP at a glance
        </p>
      </header>

      {loading && <HomeSkeleton />}

      {error && !loading && (
        <div className="rounded bg-surface p-8 text-center">
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

      {!loading && !error && quotes && quotes.quotes.length === 0 && (
        <div className="rounded bg-surface p-8 text-center">
          <p className="text-sm text-text-secondary">
            We don&apos;t yet support {quotes.from} → {quotes.to} transfers.
          </p>
        </div>
      )}

      {!loading && !error && quotes && quotes.quotes.length > 0 && (
        <>
          <HeroCard quotes={quotes} delta={delta} />

          <div className="mb-3 mt-8 flex items-baseline justify-between">
            <h2 className="text-lg font-bold">Top providers</h2>
            <span className="text-xs text-text-tertiary">for €{SEND_AMOUNT}</span>
          </div>

          <div className="flex flex-col gap-3">
            {topThree.map((q) => (
              <TopProviderCard key={q.id} q={q} />
            ))}
          </div>

          {/* sponsored slot — 0–1 offers, see docs/modules/home.md */}

          <Link
            href="/compare"
            className="mt-6 flex items-center justify-center rounded bg-primary px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99]"
          >
            Compare all providers
          </Link>
        </>
      )}
    </main>
  );
}

function HeroCard({
  quotes,
  delta,
}: {
  quotes: QuotesResponse;
  delta: { value: number; pct: number } | null;
}) {
  const positive = delta ? delta.value >= 0 : null;
  return (
    <div
      className="rounded p-6 text-white shadow-elevated"
      style={{
        background:
          "linear-gradient(135deg, var(--primary), var(--primary-light) 60%, var(--accent))",
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
        Mid-market rate
      </div>
      <div className="tabular mt-1 text-[40px] font-extrabold leading-none">
        ₱{quotes.rate.rate.toFixed(4)}
        <span className="ml-2 text-base font-medium text-white/70">per €1</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {positive !== null && delta && (
          <span
            className={`flex items-center gap-1 font-semibold ${
              positive ? "text-success" : "text-error"
            }`}
          >
            {positive ? (
              <ArrowUp size={14} weight="bold" />
            ) : (
              <ArrowDown size={14} weight="bold" />
            )}
            {Math.abs(delta.pct).toFixed(2)}% vs yesterday
          </span>
        )}
        <span className="text-white/60">
          Updated {relativeTime(quotes.rate.timestamp)}
        </span>
      </div>
    </div>
  );
}

function ProviderIcon({ q, size }: { q: TransferQuote; size: number }) {
  if (!q.providerIcon) {
    return (
      <span
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary"
        aria-hidden
      >
        {q.providerName.charAt(0)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={q.providerIcon}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full bg-white/5 object-contain"
    />
  );
}

// Same tag/copy as Compare's SourceTag (docs/modules/comparison.md).
function SourceTag({ q }: { q: TransferQuote }) {
  if (q.source === "direct") return null;
  return (
    <span
      title={
        q.source === "mock"
          ? "Local mock data"
          : "Price attributed to this provider by Wise's comparison API, not fetched from the provider itself"
      }
      className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary"
    >
      {q.source === "mock" ? "mock" : "via Wise"}
    </span>
  );
}

function TopProviderCard({ q }: { q: TransferQuote }) {
  return (
    <Link
      href={`/provider/${q.providerID}`}
      className="flex items-center gap-3 rounded bg-surface p-4 shadow transition hover:bg-surface-hover"
    >
      <ProviderIcon q={q} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold">{q.providerName}</span>
          <SourceTag q={q} />
        </div>
        <div className="mt-0.5 text-xs text-text-tertiary">
          ₱{q.exchangeRate.toFixed(4)} per €1
        </div>
      </div>
      <div className="text-right">
        <div className="tabular text-[15px] font-bold text-success">
          ₱{php.format(q.receiveAmount)}
        </div>
        <div className="text-xs text-text-tertiary">recipient gets</div>
      </div>
    </Link>
  );
}

function HomeSkeleton() {
  return (
    <>
      <div className="h-[132px] animate-pulse rounded bg-surface" />
      <div className="mb-3 mt-8 h-6 w-32 animate-pulse rounded-xs bg-surface" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[68px] animate-pulse rounded bg-surface"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    </>
  );
}
