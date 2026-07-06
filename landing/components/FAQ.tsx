"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function FAQ({ dict }: { dict: Dictionary["faq"] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="preguntas" className="bg-surface-tint py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {dict.title}
        </h2>

        <div className="mt-10 divide-y divide-line rounded-[24px] border border-line bg-surface">
          {dict.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="px-6">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-medium text-ink">{item.q}</span>
                  <CaretDown
                    weight="bold"
                    className={`h-4 w-4 shrink-0 text-ink-faint transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="max-w-[60ch] pb-5 leading-relaxed text-ink-soft">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
