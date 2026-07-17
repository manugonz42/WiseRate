"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { COUNTRIES } from "@/lib/data/countries";

type Props = {
  value: string | null; // ISO 3166-1 alpha-2
  onChange: (code: string | null) => void;
  label: string;
  error?: string;
};

// Searchable "país de residencia" combobox — static countries.ts list, aria
// combobox pattern, keyboard navigable. docs/plan/T35-signup-ui.md.
export function CountrySelect({ value, onChange, label, error }: Props) {
  const { i18n } = useTranslation();
  const locale = i18n.language === "es" ? "es" : "en";
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const inputId = useId();

  const selected = value ? COUNTRIES.find((c) => c.code === value) ?? null : null;

  useEffect(() => {
    setQuery(selected ? selected[locale] : "");
  }, [selected, locale]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c[locale].toLowerCase().includes(q));
  }, [query, locale]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(selected ? selected[locale] : "");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, selected, locale]);

  const pick = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[activeIndex];
      if (hit) pick(hit.code);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery(selected ? selected[locale] : "");
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <label htmlFor={inputId} className="mb-1 block text-sm font-bold text-text-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[activeIndex] ? `${listId}-${results[activeIndex].code}` : undefined}
          aria-invalid={!!error}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(0);
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="España, Filipinas..."
          className={`w-full rounded border bg-surface px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
            error ? "border-error" : "border-border"
          }`}
        />
        <CaretDown
          size={14}
          weight="bold"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-error">{error}</p> : null}

      {open && results.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-elevated"
        >
          {results.slice(0, 50).map((c, i) => (
            <li
              key={c.code}
              id={`${listId}-${c.code}`}
              role="option"
              aria-selected={c.code === value}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(c.code);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`cursor-pointer px-3 py-1.5 text-sm ${
                i === activeIndex ? "bg-surface-hover" : ""
              } ${c.code === value ? "font-bold" : ""}`}
            >
              {c[locale]}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
