"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Lock, TrendDown, TrendUp } from "@phosphor-icons/react/dist/ssr";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getHistory } from "@/lib/services/history";
import { getQuotes } from "@/lib/services/rate";
import { computeStats } from "@/lib/services/analytics-stats";
import { track } from "@/lib/analytics";
import type { HistoryRange, HistoryResponse } from "@/lib/models/types";

const SEND_AMOUNT = 500;
const RANGES: HistoryRange[] = ["7D", "30D", "3M", "6M", "1Y"];
const LOCKED_RANGES = new Set<HistoryRange>(["3M", "6M", "1Y"]);

export default function AnalyticsPage() {
  const router = useRouter();

  const [range, setRange] = useState<HistoryRange>("7D");
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [midRate, setMidRate] = useState<number | null>(null);

  useEffect(() => {
    getQuotes(SEND_AMOUNT)
      .then((q) => setMidRate(q.rate.rate))
      .catch(() => setMidRate(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getHistory(range)
      .then((h) => {
        if (!cancelled) setHistory(h);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const stats = useMemo(() => computeStats(history?.rates ?? []), [history]);

  const yDomain = useMemo((): [number, number] | undefined => {
    if (!stats) return undefined;
    return [stats.low * 0.995, stats.high * 1.005];
  }, [stats]);

  const handleRangeChange = (r: HistoryRange) => {
    if (LOCKED_RANGES.has(r) || r === range) return;
    // Props per docs/services/analytics.md: { from, to } transition, not { range }.
    track("analytics.timeframe_changed", { from: range, to: r });
    setRange(r);
  };

  const alertHref =
    midRate !== null ? `/alerts?rate=${midRate.toFixed(4)}` : "/alerts";
  const hasData = !loading && !error && history && history.rates.length > 0;

  return (
    <main className="mx-auto min-h-[100dvh] max-w-4xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
            Analytics
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary">
            EUR → PHP rate trends.
          </p>
        </div>
        <button
          onClick={() => router.push(alertHref)}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-light transition active:scale-[0.97]"
        >
          <Bell size={16} weight="bold" />
          Set alert at this rate
        </button>
      </header>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {RANGES.map((r) => {
          const locked = LOCKED_RANGES.has(r);
          const active = range === r;
          return (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              title={locked ? "Premium — coming soon" : undefined}
              aria-disabled={locked}
              className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "bg-primary text-primary-light"
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

      {/* Stats card */}
      {loading && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-surface" />
          ))}
        </div>
      )}
      {!loading && stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="High" value={`₱${stats.high.toFixed(2)}`} />
          <Stat label="Low" value={`₱${stats.low.toFixed(2)}`} />
          <Stat label="Average" value={`₱${stats.average.toFixed(2)}`} />
          <Stat
            label="Change"
            value={`${stats.changePct >= 0 ? "+" : ""}${stats.changePct.toFixed(2)}%`}
            valueClassName={stats.changePct >= 0 ? "text-success" : "text-error"}
            icon={stats.changePct >= 0 ? TrendUp : TrendDown}
          />
        </div>
      )}

      {/* Chart */}
      <div className="rounded bg-surface p-5 shadow">
        {loading && (
          <div className="h-[280px] animate-pulse rounded-xs bg-bg" />
        )}
        {!loading && !hasData && (
          <div className="flex h-[280px] items-center justify-center text-sm text-text-tertiary">
            Historical data unavailable.
          </div>
        )}
        {hasData && (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={history!.rates}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                tickFormatter={(v: string) =>
                  new Date(v).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                }
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={yDomain ?? ["auto", "auto"]}
                tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                tickFormatter={(v: number) => v.toFixed(2)}
                axisLine={false}
                tickLine={false}
                width={48}
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
                stroke="var(--primary-dark)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  valueClassName,
  icon: Icon,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  icon?: typeof TrendUp;
}) {
  return (
    <div className="rounded bg-surface p-4 shadow">
      <div className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
        {label}
      </div>
      <div
        className={`tabular mt-1 flex items-center gap-1 text-lg font-bold ${valueClassName ?? ""}`}
      >
        {Icon && <Icon size={14} weight="bold" />}
        {value}
      </div>
    </div>
  );
}
