"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarBlank, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { formatIsoToDisplay, isoDate, maskDobInput, parseDisplayDate } from "@/lib/dob";

type Props = {
  value: string | null; // ISO 8601 date, or null
  onChange: (iso: string | null) => void;
  label: string;
  placeholder?: string;
  error?: string;
};

const CURRENT_YEAR = new Date().getUTCFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const MONTH_KEYS = Array.from({ length: 12 }, (_, i) => i);
const MIN_AGE_DEFAULT = 30; // calendar opens ~30y back by default (no date picked yet)

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

// Typeable "DD/MM/YYYY" input + calendar icon opening a lightweight custom
// popover (month/year selects + day grid) — docs/plan/T35-signup-ui.md.
// Typing and picking stay in sync through the shared `value` (ISO) prop.
export function DateOfBirthField({ value, onChange, label, placeholder, error }: Props) {
  const [text, setText] = useState(value ? formatIsoToDisplay(value) : "");
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [viewYear, setViewYear] = useState(
    value ? Number(value.slice(0, 4)) : today.getUTCFullYear() - MIN_AGE_DEFAULT,
  );
  const [viewMonth, setViewMonth] = useState(
    value ? Number(value.slice(5, 7)) - 1 : today.getUTCMonth(),
  );
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    setText(value ? formatIsoToDisplay(value) : "");
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleTextChange = (raw: string) => {
    const masked = maskDobInput(raw);
    setText(masked);
    const parsed = parseDisplayDate(masked);
    onChange(parsed);
    if (parsed) {
      setViewYear(Number(parsed.slice(0, 4)));
      setViewMonth(Number(parsed.slice(5, 7)) - 1);
    }
  };

  const pickDay = (day: number) => {
    const iso = isoDate(new Date(Date.UTC(viewYear, viewMonth, day)));
    setText(formatIsoToDisplay(iso));
    onChange(iso);
    setOpen(false);
  };

  const selectedDay =
    value && Number(value.slice(0, 4)) === viewYear && Number(value.slice(5, 7)) - 1 === viewMonth
      ? Number(value.slice(8, 10))
      : null;

  const firstWeekday = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
  const dayCount = daysInMonth(viewYear, viewMonth);
  const leadingBlanks = (firstWeekday + 6) % 7; // week starts Monday

  return (
    <div className="relative">
      <label htmlFor={inputId} className="mb-1 block text-sm font-bold text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={placeholder ?? "DD/MM/AAAA"}
          className={`w-full rounded border bg-surface px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? "border-error" : "border-border"
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open calendar"
          aria-expanded={open}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-tertiary transition hover:bg-surface-hover"
        >
          <CalendarBlank size={18} weight="bold" />
        </button>
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs font-medium text-error">
          {error}
        </p>
      ) : null}

      {open ? (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Calendar"
          className="absolute z-20 mt-2 w-72 rounded-lg border border-border bg-surface p-3 shadow-elevated"
        >
          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setViewMonth((m) => {
                  if (m === 0) {
                    setViewYear((y) => y - 1);
                    return 11;
                  }
                  return m - 1;
                })
              }
              aria-label="Previous month"
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-surface-hover"
            >
              <CaretLeft size={14} weight="bold" />
            </button>
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="flex-1 rounded border border-border bg-surface px-2 py-1 text-sm"
              aria-label="Month"
            >
              {MONTH_KEYS.map((m) => (
                <option key={m} value={m}>
                  {new Date(Date.UTC(2000, m, 1)).toLocaleDateString(undefined, {
                    month: "long",
                    timeZone: "UTC",
                  })}
                </option>
              ))}
            </select>
            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="rounded border border-border bg-surface px-2 py-1 text-sm"
              aria-label="Year"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                setViewMonth((m) => {
                  if (m === 11) {
                    setViewYear((y) => y + 1);
                    return 0;
                  }
                  return m + 1;
                })
              }
              aria-label="Next month"
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-surface-hover"
            >
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-text-tertiary">
            {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
              <span key={`${d}-${i}`}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: dayCount }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => pickDay(day)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition hover:bg-surface-hover ${
                  selectedDay === day ? "bg-primary font-bold text-primary-light" : ""
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
