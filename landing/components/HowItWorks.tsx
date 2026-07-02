"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Calculator,
  MagnifyingGlass,
  PaperPlaneTilt,
} from "@phosphor-icons/react";
import type { Dictionary } from "@/lib/i18n/dictionary";

const ICONS = [Calculator, MagnifyingGlass, PaperPlaneTilt];

export function HowItWorks({ dict }: { dict: Dictionary["how"] }) {
  const reduce = useReducedMotion();

  return (
    <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-24">
      <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        {dict.title}
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
        {dict.steps.map((step, i) => {
          const Icon = ICONS[i];
          const big = i === 0;
          return (
            <motion.div
              key={step.title}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`rounded-[28px] border border-line bg-surface p-8 ${
                big ? "md:col-span-2 md:flex md:items-center md:gap-10" : ""
              }`}
            >
              <div
                className={
                  big
                    ? "flex items-center gap-6 md:w-1/2"
                    : "flex items-center gap-4"
                }
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft">
                  <Icon weight="bold" className="h-6 w-6 text-accent" />
                </span>
                <h3 className="font-display text-xl font-semibold text-ink">
                  {step.title}
                </h3>
              </div>
              <p
                className={`mt-4 leading-relaxed text-ink-soft ${
                  big ? "md:mt-0 md:w-1/2" : ""
                }`}
              >
                {step.body}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
