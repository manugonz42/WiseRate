"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { getQuotes } from "@/lib/services/rate";
import { getHistory } from "@/lib/services/history";
import { getDefaultAmount } from "@/lib/services/persistence";
import { track } from "@/lib/analytics";
import { PROVIDERS } from "@/lib/data/providers";
import type {
  HistoryResponse,
  QuotesResponse,
  TransferQuote,
} from "@/lib/models/types";
import {
  ArrowClockwise,
  ArrowDown,
  ArrowUp,
  RocketLaunch,
} from "@phosphor-icons/react/dist/ssr";
import { SidebarSlot } from "@/components/SidebarSlot";

// Preset chip amounts — default €200 (docs/modules/home.md).
const AMOUNTS = [100, 200, 500, 1000];
const DEFAULT_AMOUNT = 200;

const php = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const eur = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

// "2m ago" / "3h ago" — computed at render time, no ticking interval (T04 scope).
function relativeTime(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

// Tween a number to its new value (600ms ease-out cubic). Instant under
// reduced motion — see design-system.md Animation.
function useCountUp(target: number, duration = 600): number {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);

  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (
      from === target ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(target);
      return;
    }
    let raf: number;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

// Outbound URL for the winner CTA — same fallback chain as Compare.
const sendURL = (q: TransferQuote): string | null => {
  const p = PROVIDERS[q.providerID];
  return p ? (p.affiliateURL ?? p.websiteURL) : null;
};

// Find the chip closest to a value; ties → lower value.
const getInitialChip = (stored: number | null): number => {
  if (stored === null) return DEFAULT_AMOUNT;
  let closest = AMOUNTS[0];
  let minDist = Math.abs(stored - AMOUNTS[0]);
  for (const amount of AMOUNTS) {
    const dist = Math.abs(stored - amount);
    if (dist < minDist || (dist === minDist && amount < closest)) {
      closest = amount;
      minDist = dist;
    }
  }
  return closest;
};

export default function HomePage() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [quotes, setQuotes] = useState<QuotesResponse | null>(null);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Read default amount from localStorage on mount.
  useEffect(() => {
    const stored = getDefaultAmount();
    setAmount(getInitialChip(stored));
  }, []);

  // 7D history feeds the ring meter — nice-to-have, fetched once.
  useEffect(() => {
    getHistory("7D")
      .then(setHistory)
      .catch(() => setHistory(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const q = await getQuotes(amount);
        if (!cancelled) setQuotes(q);
      } catch {
        if (!cancelled) setError(t("home.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [amount, reloadKey, t]);

  const ranked = useMemo(() => {
    if (!quotes) return [];
    return [...quotes.quotes].sort((a, b) => b.receiveAmount - a.receiveAmount);
  }, [quotes]);

  const best = ranked[0];
  const avgReceive = useMemo(() => {
    if (ranked.length === 0) return 0;
    return ranked.reduce((s, q) => s + q.receiveAmount, 0) / ranked.length;
  }, [ranked]);
  const extra = best ? Math.max(0, Math.round(best.receiveAmount - avgReceive)) : 0;

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

  // Where today's rate sits inside the 7-day range (0..1) for the ring meter.
  const meterPct = useMemo(() => {
    if (!history || history.rates.length < 2 || !quotes) return null;
    const rates = history.rates.map((r) => r.rate);
    const low = Math.min(...rates);
    const high = Math.max(...rates);
    if (high === low) return null;
    return Math.min(1, Math.max(0, (quotes.rate.rate - low) / (high - low)));
  }, [history, quotes]);

  // Amount switches keep stale data visible (dimmed), no re-skeleton.
  const initialLoading = loading && !quotes;

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-md px-4 pb-16 pt-6 sm:px-6 lg:min-h-0 lg:max-w-none lg:p-0">
      <h1 className="sr-only">EUR → PHP — today&apos;s best transfer deal</h1>

      {initialLoading && <HomeSkeleton />}

      {error && !loading && (
        <div className="rounded bg-surface p-8 text-center shadow">
          <p className="mb-4 text-sm text-text-secondary">{error}</p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-light transition active:scale-[0.97]"
          >
            <ArrowClockwise size={14} weight="bold" />
            {t("home.retryButton")}
          </button>
        </div>
      )}

      {!initialLoading && !error && quotes && ranked.length === 0 && (
        <div className="rounded bg-surface p-8 text-center shadow">
          <p className="text-sm text-text-secondary">
            {t("home.noSupport", {from: quotes.from, to: quotes.to})}
          </p>
        </div>
      )}

      {!initialLoading && !error && quotes && best && (
        <div
          className={`transition-opacity lg:hidden ${
            loading ? "opacity-60" : "opacity-100"
          }`}
        >
          <div className="flex flex-col gap-5">
            <SavingsCard
              extra={extra}
              providerCount={ranked.length}
              meterPct={meterPct}
              t={t as TFunction}
            />

            <div className="flex gap-2" role="group" aria-label="Send amount">
              {AMOUNTS.map((a) => {
                const selected = a === amount;
                return (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    aria-pressed={selected}
                    className={`flex-1 rounded-sm py-2.5 text-[15px] font-extrabold transition ${
                      selected
                        ? "chip-pop bg-primary text-primary-light"
                        : "bg-surface text-text-tertiary shadow hover:text-text-secondary active:scale-[0.97]"
                    }`}
                  >
                    €{a}
                  </button>
                );
              })}
            </div>

            <Hero quotes={quotes} best={best} delta={delta} t={t} />
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {ranked.length >= 3 ? (
              <Podium ranked={ranked} extra={extra} />
            ) : (
              ranked.map((q, i) => <RankRow key={q.id} q={q} rank={i + 1} />)
            )}

            <SendCTA q={best} />

            {ranked.slice(3, 5).map((q, i) => (
              <RankRow key={q.id} q={q} rank={i + 4} />
            ))}

            {/* sponsored slot — 0–1 offers, see docs/modules/home.md */}

            <Link
              href="/compare"
              className="py-1 text-center text-sm font-extrabold text-primary-dark transition active:scale-[0.98]"
            >
              {t("home.seeFullRanking", {count: ranked.length})}
            </Link>

            <p className="text-center text-[11px] text-text-tertiary">
              {t("home.commissionDisclaimer")}{" "}
              <Link href="/how-we-make-money" className="underline">
                {t("footer.howWeMakeMoney")}
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* lg+ split hero: marketing hero teleported into the ink panel (left),
          winner card + ranking on the light panel (right). Same state as the
          mobile tree above — CSS breakpoint only (docs/modules/home.md). Nav is
          rendered by the (tabs) layout at the top of the light panel. */}
      {!initialLoading && !error && quotes && best && (
        <div className="hidden lg:block">
          <SidebarSlot>
            <div
              className={`flex flex-1 flex-col text-bg transition-opacity ${
                loading ? "opacity-60" : "opacity-100"
              }`}
            >
              <h2 className="text-[40px] font-extrabold leading-[1.06] tracking-tight">
                Send €{amount} home.
                <br />
                Get{" "}
                <span style={{ color: "var(--lime)" }}>
                  ₱{php.format(extra)} more
                </span>
                <br />
                than average.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-bg/70">
                {t("home.rankProviders", {count: ranked.length})}
                <br />
                {t("home.rateInfo", {rate: quotes.rate.rate.toFixed(2)})}{" "}
                {delta && (
                  <span
                    className={`font-bold ${
                      delta.value >= 0 ? "text-[#b6e560]" : "text-[#f0908a]"
                    }`}
                  >
                    {delta.value >= 0 ? (
                      <ArrowUp size={11} weight="bold" className="inline" />
                    ) : (
                      <ArrowDown size={11} weight="bold" className="inline" />
                    )}{" "}
                    {Math.abs(delta.pct).toFixed(2)}%
                  </span>
                )}
              </p>

              <div
                className="mt-7 flex gap-2"
                role="group"
                aria-label="Send amount"
              >
                {AMOUNTS.map((a) => {
                  const selected = a === amount;
                  return (
                    <button
                      key={a}
                      onClick={() => setAmount(a)}
                      aria-pressed={selected}
                      className={`rounded-full px-5 py-2.5 text-sm font-extrabold transition active:scale-[0.97] ${
                        selected
                          ? "text-primary"
                          : "bg-white/10 text-bg opacity-80 hover:opacity-100"
                      }`}
                      style={selected ? { background: "var(--lime)" } : undefined}
                    >
                      €{a}
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-8">
                <div className="flex items-center gap-4 border-t border-white/[0.12] pt-6">
                  {meterPct !== null && (
                    <div
                      role="img"
                      aria-label={`Today's rate is at ${Math.round(meterPct * 100)}% of its 7-day range`}
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
                      style={{
                        background: `conic-gradient(var(--lime) 0 ${meterPct * 100}%, rgba(255,255,255,0.14) ${meterPct * 100}% 100%)`,
                      }}
                    >
                      <div
                        className="grid h-11 w-11 place-items-center rounded-full bg-primary text-xs font-extrabold"
                        style={{ color: "var(--lime)" }}
                      >
                        {Math.round(meterPct * 100)}%
                      </div>
                    </div>
                  )}
                  <div className="flex min-w-0 flex-col">
                    <span
                      className="text-lg font-extrabold"
                      style={{ color: "var(--lime)" }}
                    >
                      +₱{php.format(extra)} vs average
                    </span>
                    <span className="text-xs text-bg/60">
                      always picking the best deal 💪 · across {ranked.length}{" "}
                      providers
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SidebarSlot>

          <div
            className={`transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}
          >
            <p className="text-sm font-semibold text-text-secondary">
              {t("home.familyGetsUpTo")}
            </p>
            <DesktopWinner q={best} extra={extra} t={t} />
            <div className="mt-3 flex flex-col gap-2.5">
              {ranked.slice(1, 5).map((q, i) => (
                <DesktopRankRow key={q.id} q={q} rank={i + 2} />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between gap-4 text-[11px] text-text-tertiary">
              <p>
                {t("home.commissionDisclaimer")}{" "}
                <Link href="/how-we-make-money" className="underline">
                  {t("footer.howWeMakeMoney")}
                </Link>
              </p>
              <Link
                href="/compare"
                className="shrink-0 text-xs font-extrabold text-primary-dark transition active:scale-[0.98]"
              >
                {t("home.seeFullRanking", {count: ranked.length})}
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// lg+ winner card: lime hero with the top provider, its fee/speed, receive
// amount, a peeking crown, and an embedded dark affiliate CTA (mockup).
function DesktopWinner({ q, extra, t }: { q: TransferQuote; extra: number; t: TFunction }) {
  const url = sendURL(q);
  const fast =
    q.deliveryEstimate.maxMinutes > 0 && q.deliveryEstimate.maxMinutes <= 60;
  const btnClass =
    "btn-pop mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-base font-extrabold";
  const label = (
    <>
      {t("home.sendWith", {provider: q.providerName})}
      <RocketLaunch size={18} weight="fill" />
    </>
  );
  return (
    <div
      className="relative mt-2 rounded-[22px] p-6 text-primary shadow-elevated"
      style={{ background: "var(--lime)" }}
    >
      {extra > 0 && (
        <span className="crown-bounce absolute -top-3.5 left-6 text-2xl" aria-hidden>
          👑
        </span>
      )}
      <div className="flex items-center gap-4">
        <ProviderIcon q={q} size={52} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xl font-extrabold">{q.providerName}</div>
          <div className="mt-0.5 text-[13px] font-semibold text-primary/70">
            {q.fee === 0 ? "€0 fee" : `${eur.format(q.fee)} fee`} ·{" "}
            {q.deliveryEstimate.maxMinutes === 0
              ? "n/a"
              : q.deliveryEstimate.label}
            {fast && " ⚡"}
          </div>
        </div>
        <div className="tabular text-[32px] font-extrabold leading-none">
          ₱{php.format(q.receiveAmount)}
        </div>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="sponsored noopener"
          onClick={() =>
            track("home.affiliate_outbound", { providerID: q.providerID })
          }
          className={btnClass}
          style={{ color: "var(--lime)" }}
        >
          {label}
        </a>
      ) : (
        <Link
          href={`/provider/${q.providerID}`}
          className={btnClass}
          style={{ color: "var(--lime)" }}
        >
          {label}
        </Link>
      )}
    </div>
  );
}

// lg+ runner-up row: clean white card, rank medal, provider + meta, amount.
function DesktopRankRow({ q, rank }: { q: TransferQuote; rank: number }) {
  const fast =
    q.deliveryEstimate.maxMinutes > 0 && q.deliveryEstimate.maxMinutes <= 60;
  const meta =
    q.fee === 0
      ? "€0 fee"
      : q.deliveryEstimate.maxMinutes === 0
        ? null
        : q.deliveryEstimate.label;
  return (
    <Link
      href={`/provider/${q.providerID}`}
      className="rise flex items-center gap-3.5 rounded-[16px] bg-surface px-5 py-3.5 shadow transition hover:bg-surface-hover active:scale-[0.995]"
      style={{ animationDelay: `${rank * 50}ms` }}
    >
      <span className="w-6 shrink-0 text-sm font-extrabold text-text-tertiary">
        {rank}º
      </span>
      <ProviderIcon q={q} size={36} />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate font-bold">{q.providerName}</span>
        {meta && (
          <span className="hidden text-xs text-text-tertiary xl:inline">
            · {meta}
            {fast && " ⚡"}
          </span>
        )}
        <SourceTag q={q} />
      </div>
      <span className="tabular text-[15px] font-extrabold">
        ₱{php.format(q.receiveAmount)}
      </span>
    </Link>
  );
}

// Dark ink card: how much the best pick beats the average, plus a ring
// showing where today's rate sits in the 7-day range.
function SavingsCard({
  extra,
  providerCount,
  meterPct,
  t,
}: {
  extra: number;
  providerCount: number;
  meterPct: number | null;
  t: TFunction;
}) {
  return (
    <div className="rise flex items-center gap-4 rounded bg-primary p-5 text-bg">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
          {t("home.beatAverage")}
        </span>
        <span className="tabular text-[28px] font-extrabold leading-tight tracking-tight text-primary-light">
          ₱{php.format(extra)}
        </span>
        <span className="text-xs opacity-70">
          {t("home.acrossProviders", {count: providerCount})}
        </span>
      </div>
      {meterPct !== null && (
        <div className="flex shrink-0 flex-col items-center gap-1">
          <div
            role="img"
            aria-label={`Today's rate is at ${Math.round(meterPct * 100)}% of its 7-day range`}
            className="grid h-14 w-14 place-items-center rounded-full"
            style={{
              background: `conic-gradient(var(--primary-light) 0 ${meterPct * 100}%, rgba(255,255,255,0.15) ${meterPct * 100}% 100%)`,
            }}
          >
            <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-light">
              {Math.round(meterPct * 100)}%
            </div>
          </div>
          <span className="text-[10px] opacity-70">{t("home.of7DayHigh")}</span>
        </div>
      )}
    </div>
  );
}

function Hero({
  quotes,
  best,
  delta,
  t,
}: {
  quotes: QuotesResponse;
  best: TransferQuote;
  delta: { value: number; pct: number } | null;
  t: TFunction;
}) {
  const animated = useCountUp(best.receiveAmount);
  const positive = delta ? delta.value >= 0 : null;
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <span className="text-[13px] font-semibold text-text-secondary">
        {t("home.familyGetsUpTo")}
      </span>
      <span className="tabular text-[46px] font-extrabold leading-none tracking-tight">
        ₱{php.format(animated)}
      </span>
      <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs text-text-secondary">
        {t("home.rateInfo", {rate: quotes.rate.rate.toFixed(2)})} · updated{" "}
        {relativeTime(quotes.rate.timestamp)}
        {positive !== null && delta && (
          <span
            className={`flex items-center gap-0.5 font-bold ${
              positive ? "text-success" : "text-error"
            }`}
          >
            {positive ? (
              <ArrowUp size={12} weight="bold" />
            ) : (
              <ArrowDown size={12} weight="bold" />
            )}
            {Math.abs(delta.pct).toFixed(2)}% {t("home.vsYesterday")}
          </span>
        )}
      </span>
    </div>
  );
}

// Top 3 as a podium, rendered 2-1-3 so the winner towers in the middle.
function Podium({ ranked, extra }: { ranked: TransferQuote[]; extra: number }) {
  const [first, second, third] = ranked;
  return (
    <div className="flex items-end gap-2">
      <PodiumCol q={second} place={2} />
      <PodiumCol q={first} place={1} extra={extra} />
      <PodiumCol q={third} place={3} />
    </div>
  );
}

function PodiumCol({
  q,
  place,
  extra,
}: {
  q: TransferQuote;
  place: 1 | 2 | 3;
  extra?: number;
}) {
  const winner = place === 1;
  const bar = winner
    ? "rounded-t-sm bg-gradient-to-b from-primary-light to-[#B5DC3B] pb-4 pt-4 shadow-[0_-6px_24px_rgba(198,232,78,0.55)]"
    : place === 2
      ? "rounded-t-xs bg-podium-2 pb-2.5 pt-3"
      : "rounded-t-xs bg-podium-3 pb-2 pt-2";
  return (
    <Link
      href={`/provider/${q.providerID}`}
      className={`rise flex flex-col items-center gap-1.5 transition active:scale-[0.98] ${
        winner ? "flex-[1.15]" : "flex-1"
      }`}
      style={{ animationDelay: `${place * 60}ms` }}
    >
      {winner && (
        <span className="crown-bounce text-xl" aria-hidden>
          👑
        </span>
      )}
      <ProviderIcon q={q} size={winner ? 44 : 40} />
      <div
        className={`flex w-full flex-col items-center gap-0.5 px-1.5 text-center ${bar}`}
      >
        <span
          className={`tabular font-extrabold ${winner ? "text-lg" : "text-[15px]"}`}
        >
          {php.format(q.receiveAmount)}
        </span>
        <span
          className={`text-[10px] font-bold truncate max-w-full ${winner ? "text-primary" : "text-text-secondary"}`}
        >
          {place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉"} {q.providerName}
        </span>
        <span
          className={`text-[10px] font-bold ${winner ? "text-primary" : "text-text-secondary"}`}
        >
          {q.fee === 0 ? "€0 fee" : `${eur.format(q.fee)} fee`}
        </span>
        {q.source !== "direct" && (
          <span className="text-[9px] font-semibold opacity-60">
            {q.source === "mock" ? "mock" : "via Wise"}
          </span>
        )}
        {winner && typeof extra === "number" && extra > 0 && (
          <span className="mt-0.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold text-chartreuse">
            +₱{php.format(extra)} EXTRA
          </span>
        )}
      </div>
    </Link>
  );
}

// Winner CTA — affiliate/website link when we have one, provider detail
// otherwise. Chunky pop shadow per design-system.md. `invert` flips to a
// lime-on-ink treatment for the desktop sidebar.
function SendCTA({ q, invert = false }: { q: TransferQuote; invert?: boolean }) {
  const url = sendURL(q);
  const className = `btn-pop flex w-full items-center justify-center gap-2 rounded px-4 py-3.5 text-base font-extrabold ${
    invert ? "bg-primary-light text-primary" : "bg-primary text-primary-light"
  }`;
  const label = (
    <>
      Send with {q.providerName}
      <RocketLaunch size={18} weight="fill" />
    </>
  );
  if (!url) {
    return (
      <Link href={`/provider/${q.providerID}`} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="sponsored noopener"
      onClick={() =>
        track("home.affiliate_outbound", { providerID: q.providerID })
      }
      className={className}
    >
      {label}
    </a>
  );
}

function ProviderIcon({ q, size }: { q: TransferQuote; size: number }) {
  if (!q.providerIcon) {
    return (
      <span
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-sm bg-surface text-sm font-extrabold text-primary shadow"
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
      className="shrink-0 rounded-sm bg-surface object-contain shadow"
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

// Compact row for ranks outside the podium (and the <3-quotes fallback).
function RankRow({ q, rank }: { q: TransferQuote; rank: number }) {
  return (
    <Link
      href={`/provider/${q.providerID}`}
      className="rise flex items-center gap-3 rounded-sm bg-surface px-4 py-3 shadow transition hover:bg-surface-hover active:scale-[0.99]"
      style={{ animationDelay: `${rank * 60}ms` }}
    >
      <span className="w-6 shrink-0 text-sm font-extrabold text-text-secondary">
        {rank}º
      </span>
      <ProviderIcon q={q} size={28} />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm font-bold">{q.providerName}</span>
        <span className="hidden text-xs text-text-tertiary sm:inline">
          · {q.deliveryEstimate.maxMinutes === 0 ? "n/a" : q.deliveryEstimate.label}
        </span>
        <SourceTag q={q} />
      </div>
      <span className="tabular text-[15px] font-extrabold">
        ₱{php.format(q.receiveAmount)}
      </span>
    </Link>
  );
}

function HomeSkeleton() {
  return (
    <>
      <div className="lg:hidden">
        <div className="flex flex-col gap-5">
          <div className="h-[104px] animate-pulse rounded bg-surface" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-11 flex-1 animate-pulse rounded-sm bg-surface"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
          <div className="mx-auto h-20 w-56 animate-pulse rounded bg-surface" />
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <div className="h-40 animate-pulse rounded bg-surface" />
          <div className="h-[52px] animate-pulse rounded bg-surface" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-[52px] animate-pulse rounded-sm bg-surface"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </div>
      {/* lg+: split-hero shaped placeholders. The light panel bg comes from the
          (tabs) layout, so the right column stays unwrapped here. */}
      <div className="hidden lg:block">
        <SidebarSlot>
          <div className="flex flex-1 flex-col gap-5">
            <div className="h-28 animate-pulse rounded-sm bg-white/10" />
            <div className="h-9 w-56 animate-pulse rounded-full bg-white/10" />
            <div className="mt-auto h-16 animate-pulse rounded-sm bg-white/10" />
          </div>
        </SidebarSlot>
        <div>
          <div className="mb-2 h-4 w-40 animate-pulse rounded-xs bg-surface" />
          <div className="h-[132px] animate-pulse rounded-[22px] bg-surface" />
          <div className="mt-3 flex flex-col gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[62px] animate-pulse rounded-[16px] bg-surface"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
