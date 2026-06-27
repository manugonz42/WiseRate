"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendUp } from "@phosphor-icons/react";
import { generateQuotes } from "@/lib/services/mockData";
import { formatPHP } from "@/lib/format";

// Real comparison widget (not a div mockup, taste-skill §4.8): runs the same
// mock quote engine the app uses, so the hero shows live-looking numbers.
const PRESETS = [200, 500, 1000];

export function LiveQuoteWidget() {
  const [amount, setAmount] = useState(500);

  const { best, top, savings } = useMemo(() => {
    const ranked = [...generateQuotes(amount)].sort(
      (a, b) => b.receiveAmount - a.receiveAmount,
    );
    const savings = ranked.length
      ? ranked[0].receiveAmount - ranked[ranked.length - 1].receiveAmount
      : 0;
    return { best: ranked[0], top: ranked.slice(0, 3), savings };
  }, [amount]);

  return (
    <div className="rounded border border-border bg-surface-elevated p-xl shadow-elevated">
      <div className="flex items-center justify-between">
        <label htmlFor="hero-amount" className="text-caption font-medium text-text-secondary">
          You send
        </label>
        <div className="flex gap-xs">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setAmount(p)}
              className={
                "rounded-full px-md py-xs text-caption font-semibold transition-colors duration-quick ease-standard " +
                (amount === p
                  ? "bg-primary text-on-primary"
                  : "bg-surface-hover text-text-secondary hover:text-text-primary")
              }
            >
              €{p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-sm flex items-center gap-sm border-b border-border pb-md">
        <span className="text-title2 font-bold text-text-secondary">€</span>
        <input
          id="hero-amount"
          type="number"
          inputMode="decimal"
          min={0}
          value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
          className="w-full bg-transparent text-title font-extrabold tabular-nums outline-none"
          aria-label="Amount to send in euros"
        />
      </div>

      <div className="mt-lg">
        <div className="text-caption text-text-secondary">Recipient gets</div>
        <div className="mt-xs flex items-baseline gap-sm">
          <span className="text-large-title font-extrabold tabular-nums text-text-primary">
            {best ? formatPHP(best.receiveAmount) : "—"}
          </span>
        </div>
        <div className="mt-xs text-footnote text-text-secondary">
          via <span className="font-semibold text-text-primary">{best?.providerName}</span>
        </div>
      </div>

      {savings > 0 && (
        <div className="mt-md flex items-center gap-xs rounded-sm bg-[rgba(0,196,140,0.1)] px-md py-sm text-footnote font-semibold text-success">
          <TrendUp size={16} weight="bold" />
          You keep {formatPHP(savings)} more than the worst option
        </div>
      )}

      <ul className="mt-lg flex flex-col gap-xs">
        {top.map((q, i) => (
          <li
            key={q.providerID}
            className="flex items-center justify-between rounded-xs px-sm py-xs text-footnote"
          >
            <span className="flex items-center gap-sm">
              <span className="w-4 text-text-tertiary tabular-nums">{i + 1}</span>
              <span className={i === 0 ? "font-semibold text-text-primary" : "text-text-secondary"}>
                {q.providerName}
              </span>
            </span>
            <span className="tabular-nums text-text-secondary">{formatPHP(q.receiveAmount)}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/home"
        className="mt-lg flex items-center justify-center gap-sm rounded-sm bg-primary px-lg py-md text-headline font-semibold text-on-primary transition-transform duration-quick ease-standard hover:bg-primary-dark active:scale-[0.98]"
      >
        Compare rates
        <ArrowRight size={18} weight="bold" />
      </Link>
    </div>
  );
}
