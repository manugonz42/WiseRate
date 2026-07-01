"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getQuotes } from "@/lib/services/rate";
import {
  markupPercentage,
  totalCost,
  type QuotesResponse,
  type TransferQuote,
} from "@/lib/models/types";
import { Circle, Star } from "@phosphor-icons/react/dist/ssr";

type SortOption =
  | "bestRate"
  | "lowestFee"
  | "fastest"
  | "mostTrusted"
  | "cheapestTotal";

const SORTS: { id: SortOption; label: string }[] = [
  { id: "bestRate", label: "Best rate" },
  { id: "lowestFee", label: "Lowest fee" },
  { id: "fastest", label: "Fastest" },
  { id: "mostTrusted", label: "Most trusted" },
  { id: "cheapestTotal", label: "Cheapest total" },
];

// Unknown delivery times (maxMinutes === 0) sort last.
const speed = (q: TransferQuote) =>
  q.deliveryEstimate.maxMinutes === 0
    ? Number.POSITIVE_INFINITY
    : q.deliveryEstimate.maxMinutes;

const comparators: Record<SortOption, (a: TransferQuote, b: TransferQuote) => number> = {
  bestRate: (a, b) => b.receiveAmount - a.receiveAmount,
  lowestFee: (a, b) => a.fee - b.fee,
  fastest: (a, b) => speed(a) - speed(b),
  mostTrusted: (a, b) => b.trustScore - a.trustScore,
  cheapestTotal: (a, b) => totalCost(a) - totalCost(b),
};

const php = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const eur = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export default function ComparePage() {
  const [amount, setAmount] = useState(1000);
  const [data, setData] = useState<QuotesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("bestRate");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // debounce search 150ms (acceptance criteria)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  // fetch on amount change (debounced so typing doesn't hammer the proxy)
  const amountRef = useRef(amount);
  amountRef.current = amount;
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const t = setTimeout(async () => {
      try {
        const res = await getQuotes(amountRef.current);
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setError("Couldn't load quotes. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [amount]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = debounced.trim().toLowerCase();
    const rows = q
      ? data.quotes.filter((x) => x.providerName.toLowerCase().includes(q))
      : [...data.quotes];
    return rows.sort(comparators[sort]);
  }, [data, sort, debounced]);

  // Best deal = highest receive amount across ALL quotes (not just filtered).
  const best = useMemo(() => {
    if (!data || data.quotes.length === 0) return null;
    return data.quotes.reduce((a, b) =>
      b.receiveAmount > a.receiveAmount ? b : a,
    );
  }, [data]);

  const avgReceive = useMemo(() => {
    if (!data || data.quotes.length === 0) return 0;
    return (
      data.quotes.reduce((s, q) => s + q.receiveAmount, 0) / data.quotes.length
    );
  }, [data]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 pb-16 pt-8">
      <header className="mb-4">
        <h1 className="text-[28px] font-extrabold">Compare</h1>
        <p className="text-sm text-text-secondary">
          {data ? (
            <>
              Mid-market: <span className="tabular">₱{data.rate.rate.toFixed(2)}</span> per €1
            </>
          ) : (
            "EUR → PHP"
          )}
        </p>
      </header>

      {/* Amount input */}
      <label className="mb-4 flex items-center gap-3 rounded bg-surface px-4 py-3 shadow">
        <span className="text-lg text-text-secondary">€</span>
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 0))}
          className="tabular w-full bg-transparent text-2xl font-bold outline-none"
          aria-label="Send amount in EUR"
        />
      </label>

      {/* Best-deal banner — amber, matches the mobile app's semantic treatment */}
      {best && (
        <div className="mb-4 flex items-center gap-3 rounded-sm border border-warning/20 bg-warning/[0.08] px-4 py-3">
          <Star size={22} weight="fill" className="shrink-0 text-warning" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-warning">
              Best deal
            </div>
            <div className="truncate text-sm font-semibold">
              {best.providerName}
              <span className="text-text-secondary">
                {" "}
                · Save ~₱{php.format(Math.max(0, best.receiveAmount - avgReceive))} vs. average
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="tabular text-lg font-extrabold text-success">
              ₱{php.format(best.receiveAmount)}
            </div>
            <div className="text-xs text-text-tertiary">recipient gets</div>
          </div>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search providers…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 w-full rounded-sm bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-text-tertiary focus:ring-1 focus:ring-primary"
      />

      {/* Sort chips */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {SORTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSort(s.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              sort === s.id
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:bg-surface-hover"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && <SkeletonList />}
      {error && !loading && (
        <div className="rounded bg-surface p-6 text-center text-sm text-error">
          {error}
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded bg-surface p-6 text-center">
          <p className="mb-3 text-sm text-text-secondary">
            No providers match “{debounced}”.
          </p>
          <button
            onClick={() => setSearch("")}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white"
          >
            Reset search
          </button>
        </div>
      )}

      {/* Results: table on desktop (md+), stacked cards below */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <table className="hidden w-full border-collapse text-sm md:table">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-text-tertiary">
                <th className="py-2 pr-3">Provider</th>
                <th className="px-3 py-2">Recipient gets</th>
                <th className="px-3 py-2">Fee</th>
                <th className="px-3 py-2">Speed</th>
                <th className="py-2 pl-3">Trust</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <QuoteTableRow key={q.id} q={q} isBest={best?.id === q.id} />
              ))}
            </tbody>
          </table>

          <ul className="flex flex-col gap-3 md:hidden">
            {filtered.map((q) => (
              <QuoteRow key={q.id} q={q} isBest={best?.id === q.id} />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

function TrustDots({ value }: { value: number }) {
  const filled = Math.round(value * 5);
  return (
    <span className="flex items-center gap-0.5" aria-label={`Trust ${filled}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Circle
          key={i}
          size={8}
          weight="fill"
          className={i < filled ? "text-warning" : "text-border"}
        />
      ))}
    </span>
  );
}

function QuoteTableRow({ q, isBest }: { q: TransferQuote; isBest: boolean }) {
  const cell = `py-3 ${isBest ? "border-y border-warning/30 bg-warning/[0.06] first:border-l-2 first:border-l-warning first:pl-2.5 last:border-r last:border-r-warning/30" : "border-b border-border-subtle"}`;
  return (
    <tr>
      <td className={`${cell} pr-3`}>
        <div className="flex min-w-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={q.providerIcon}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 rounded-full bg-white/5 object-contain"
          />
          <span className="truncate font-semibold">{q.providerName}</span>
          {isBest && <Star size={14} weight="fill" className="shrink-0 text-warning" />}
        </div>
      </td>
      <td className={`${cell} tabular px-3 font-semibold text-success`}>
        ₱{php.format(q.receiveAmount)}
      </td>
      <td className={`${cell} tabular px-3 text-text-secondary`}>{eur.format(q.fee)}</td>
      <td className={`${cell} px-3 text-text-secondary`}>{q.deliveryEstimate.label}</td>
      <td className={`${cell} pl-3`}>
        <TrustDots value={q.trustScore} />
      </td>
    </tr>
  );
}

function QuoteRow({ q, isBest }: { q: TransferQuote; isBest: boolean }) {
  return (
    <li
      className={`rounded bg-surface p-4 shadow ${
        isBest ? "border border-warning/30 bg-warning/[0.06]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={q.providerIcon}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 rounded-full bg-white/5 object-contain"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">{q.providerName}</span>
            {isBest && (
              <span className="flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-warning">
                <Star size={10} weight="fill" /> BEST
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            {q.deliveryEstimate.label} · markup {markupPercentage(q).toFixed(2)}%
            <TrustDots value={q.trustScore} />
          </div>
        </div>
        <div className="text-right">
          <div className="tabular font-bold text-success">
            ₱{php.format(q.receiveAmount)}
          </div>
          <div className="text-xs text-text-tertiary">
            fee {eur.format(q.fee)}
          </div>
        </div>
      </div>
    </li>
  );
}

function SkeletonList() {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="h-[68px] animate-pulse rounded bg-surface" />
      ))}
    </ul>
  );
}
