"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getQuotes } from "@/lib/services/rate";
import { track } from "@/lib/analytics";
import {
  markupPercentage,
  totalCost,
  type QuotesResponse,
  type TransferQuote,
} from "@/lib/models/types";
import { BROKER_THRESHOLD_EUR, BROKERS, amountBucket } from "@/lib/brokers";
import { PROVIDERS } from "@/lib/data/providers";
import { ArrowClockwise, ArrowSquareOut, Circle, Star } from "@phosphor-icons/react/dist/ssr";

// Shape rule for this page: surfaces and inputs use the 16px token
// (`rounded`), interactive chips are full pills; skeleton bars use
// `rounded-xs` to echo the square-ish table rows they stand in for.

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

const speedLabel = (q: TransferQuote) =>
  q.deliveryEstimate.maxMinutes === 0 ? "n/a" : q.deliveryEstimate.label;

// Outbound URL for the row's "Send" CTA (docs/modules/comparison.md Outputs).
// Only providers with an editorial profile carry one; affiliateURL stays null
// until agreements are signed, falling back to the provider's site.
const sendURL = (q: TransferQuote): string | null => {
  const p = PROVIDERS[q.providerID];
  return p ? (p.affiliateURL ?? p.websiteURL) : null;
};

export default function ComparePage() {
  const [amount, setAmount] = useState(1000);
  const [data, setData] = useState<QuotesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("bestRate");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const handleSortChange = (next: SortOption) => {
    if (next === sort) return;
    setSort(next);
    track("compare.sort_changed", { sortBy: next });
  };

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
  }, [amount, reloadKey]);

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
    <main className="mx-auto min-h-[100dvh] max-w-4xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
            Compare
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            EUR → PHP transfer providers
          </p>
        </div>
        {data && (
          <div className="text-right">
            <div className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              Mid-market
            </div>
            <div className="tabular text-sm font-semibold">
              ₱{data.rate.rate.toFixed(2)}
              <span className="font-normal text-text-secondary"> per €1</span>
            </div>
          </div>
        )}
      </header>

      {/* Query bar: amount + search share a row on md+ */}
      <div className="mb-3 grid gap-3 md:grid-cols-[220px_1fr]">
        <label className="flex items-center gap-2.5 rounded bg-surface px-4 py-3 shadow transition-shadow focus-within:ring-1 focus-within:ring-primary">
          <span className="text-lg text-text-secondary">€</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 0))}
            className="tabular w-full bg-transparent text-xl font-bold outline-none"
            aria-label="Send amount in EUR"
          />
        </label>
        <input
          type="text"
          placeholder="Search providers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded bg-surface px-4 py-3 text-sm outline-none placeholder:text-text-tertiary focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Sort chips */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {SORTS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSortChange(s.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-[0.97] ${
              sort === s.id
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:bg-surface-hover"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Best-deal banner — amber, matches the mobile app's semantic treatment */}
      {best && !loading && !error && (
        <div className="mb-4 flex items-center gap-3 rounded border border-warning/20 bg-warning/[0.08] px-4 py-3">
          <Star size={22} weight="fill" className="shrink-0 text-warning" />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-warning">
              Best deal
            </div>
            <div className="truncate text-sm font-semibold">
              {best.providerName}
              <span className="font-normal text-text-secondary">
                {" "}
                saves you ~₱{php.format(Math.max(0, best.receiveAmount - avgReceive))} vs. the average
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

      {/* States */}
      {loading && <SkeletonList />}
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
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded bg-surface p-8 text-center">
          <p className="mb-4 text-sm text-text-secondary">
            No providers match “{debounced}”.
          </p>
          <button
            onClick={() => setSearch("")}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition active:scale-[0.97]"
          >
            Reset search
          </button>
        </div>
      )}

      {/* Results: table on desktop (md+), stacked cards below */}
      {!loading && !error && filtered.length > 0 && (
        <div key={data?.rate.timestamp} className="results-enter">
          <table className="hidden w-full border-collapse text-sm md:table">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                <th className="py-2.5 pr-3 font-medium">Provider</th>
                <th className="px-3 py-2.5 text-right font-medium">Recipient gets</th>
                <th className="px-3 py-2.5 text-right font-medium">Fee</th>
                <th className="px-3 py-2.5 text-right font-medium">Markup</th>
                <th className="px-3 py-2.5 font-medium">Speed</th>
                <th className="px-3 py-2.5 font-medium">Trust</th>
                <th className="py-2.5 pl-3 font-medium">
                  <span className="sr-only">Send</span>
                </th>
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

          <p className="mt-4 text-[11px] text-text-tertiary">
            We may earn a commission — you pay the same.{" "}
            <Link href="/how-we-make-money" className="underline">
              How we make money
            </Link>
          </p>
        </div>
      )}

      {!loading && !error && amount >= BROKER_THRESHOLD_EUR && (
        <BrokerCard amount={amount} />
      )}
    </main>
  );
}

// Below-threshold: renders nothing, no layout shift. Kept separate from the
// ranked quote rows — brokers publish no machine-readable quotes to rank.
function BrokerCard({ amount }: { amount: number }) {
  const bucket = amountBucket(amount);
  return (
    <section
      aria-label="Specialist brokers"
      className="mt-8 rounded border border-accent/30 bg-surface-elevated p-5"
    >
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
        Specialist broker — quote via registration/phone
      </div>
      <p className="mb-4 text-sm text-text-secondary">
        Sending a large amount? A specialist broker can beat these rates.
      </p>
      <ul className="grid gap-3 sm:grid-cols-3">
        {BROKERS.map((b) => (
          <li key={b.id} className="flex flex-col gap-2 rounded bg-surface p-4">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent"
                aria-hidden
              >
                {b.name.charAt(0)}
              </span>
              <span className="font-semibold">{b.name}</span>
            </div>
            <p className="flex-1 text-xs text-text-secondary">{b.pitch}</p>
            <a
              href={b.url}
              target="_blank"
              rel="sponsored noopener"
              onClick={() =>
                track("compare.broker_outbound", {
                  brokerID: b.id,
                  amountBucket: bucket,
                })
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white transition active:scale-[0.97]"
            >
              Get a quote
              <ArrowSquareOut size={12} weight="bold" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] text-text-tertiary">
        We may earn a commission — you pay the same.
      </p>
    </section>
  );
}

function ProviderIcon({ q, size }: { q: TransferQuote; size: number }) {
  if (!q.providerIcon) {
    // Direct sources don't ship a logo URL (only the Wise CDN does).
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

// "via Wise" / "mock" tag on quotes not fetched from the provider itself.
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

function PromoTag({ q }: { q: TransferQuote }) {
  if (!q.isPromotion) return null;
  return (
    <span
      title={q.promo?.description}
      className="shrink-0 rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-bold text-success"
    >
      PROMO
    </span>
  );
}

// Second line under the receive amount: the first-transfer price, or a note
// when the provider publishes no standard (no-promo) price.
function PromoReceiveLine({ q }: { q: TransferQuote }) {
  if (!q.promo) return null;
  if (!q.promo.baseIsStandard) {
    return (
      <div className="text-[11px] font-normal text-text-tertiary">
        promo price, no-promo n/a
      </div>
    );
  }
  return (
    <div className="text-[11px] font-normal text-success">
      1st transfer: ₱{php.format(q.promo.promoReceiveAmount)}
    </div>
  );
}

// Per-row affiliate CTA. Stops propagation so the row's navigate-to-detail
// click doesn't also fire.
function SendButton({ q }: { q: TransferQuote }) {
  const url = sendURL(q);
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="sponsored noopener"
      onClick={(e) => {
        e.stopPropagation();
        track("compare.affiliate_outbound", { providerID: q.providerID });
      }}
      className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white transition active:scale-[0.97]"
    >
      Send
      <ArrowSquareOut size={12} weight="bold" />
    </a>
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
  const router = useRouter();
  const cell = `py-3 transition-colors ${
    isBest
      ? "border-y border-warning/30 bg-warning/[0.06] first:border-l-2 first:border-l-warning first:pl-2.5 last:border-r last:border-r-warning/30"
      : "border-b border-border-subtle"
  }`;
  return (
    <tr
      className={`cursor-pointer ${isBest ? "" : "hover:bg-surface/60"}`}
      tabIndex={0}
      role="link"
      onClick={() => router.push(`/provider/${q.providerID}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/provider/${q.providerID}`);
      }}
    >
      <td className={`${cell} pr-3`}>
        <div className="flex min-w-0 items-center gap-2">
          <ProviderIcon q={q} size={24} />
          <span className="truncate font-semibold">{q.providerName}</span>
          <PromoTag q={q} />
          <SourceTag q={q} />
          {isBest && <Star size={14} weight="fill" className="shrink-0 text-warning" />}
        </div>
      </td>
      <td className={`${cell} tabular px-3 text-right text-[15px] font-bold`}>
        ₱{php.format(q.receiveAmount)}
        <PromoReceiveLine q={q} />
      </td>
      <td className={`${cell} tabular px-3 text-right text-text-secondary`}>
        {eur.format(q.fee)}
        {q.promo?.baseIsStandard && q.promo.promoFee !== q.fee && (
          <div className="text-[11px] text-success">
            1st: {eur.format(q.promo.promoFee)}
          </div>
        )}
      </td>
      <td className={`${cell} tabular px-3 text-right text-text-secondary`}>
        {markupPercentage(q).toFixed(2)}%
      </td>
      <td className={`${cell} px-3 text-text-secondary`}>{speedLabel(q)}</td>
      <td className={`${cell} px-3`}>
        <TrustDots value={q.trustScore} />
      </td>
      <td className={`${cell} pl-3 text-right`}>
        <SendButton q={q} />
      </td>
    </tr>
  );
}

function QuoteRow({ q, isBest }: { q: TransferQuote; isBest: boolean }) {
  const router = useRouter();
  return (
    <li
      className={`cursor-pointer rounded bg-surface p-4 shadow transition hover:bg-surface-hover ${
        isBest ? "border border-warning/30 bg-warning/[0.06]" : ""
      }`}
      tabIndex={0}
      role="link"
      onClick={() => router.push(`/provider/${q.providerID}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/provider/${q.providerID}`);
      }}
    >
      <div className="flex items-center gap-3">
        <ProviderIcon q={q} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">{q.providerName}</span>
            <PromoTag q={q} />
            <SourceTag q={q} />
            {isBest && (
              <span className="flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold text-warning">
                <Star size={10} weight="fill" /> BEST
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-text-tertiary">
            {speedLabel(q)} · markup {markupPercentage(q).toFixed(2)}%
            <TrustDots value={q.trustScore} />
          </div>
        </div>
        <div className="text-right">
          <div className="tabular text-[15px] font-bold">
            ₱{php.format(q.receiveAmount)}
          </div>
          <PromoReceiveLine q={q} />
          <div className="text-xs text-text-tertiary">
            fee {eur.format(q.fee)}
          </div>
        </div>
      </div>
      {sendURL(q) && (
        <div className="mt-3 flex justify-end">
          <SendButton q={q} />
        </div>
      )}
    </li>
  );
}

function SkeletonList() {
  return (
    <>
      {/* Desktop: table-shaped skeleton */}
      <div className="hidden md:block">
        <div className="mb-1 h-8 animate-pulse rounded-xs bg-surface" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="mt-1.5 h-[46px] animate-pulse rounded-xs bg-surface"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
      {/* Mobile: card-shaped skeleton */}
      <ul className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="h-[76px] animate-pulse rounded bg-surface"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </ul>
    </>
  );
}
