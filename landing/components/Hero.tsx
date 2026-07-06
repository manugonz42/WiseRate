"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { APP_URL } from "@/lib/config";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function Hero({ dict }: { dict: Dictionary["hero"] }) {
  const reduce = useReducedMotion();

  const fadeUp = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section className="relative overflow-hidden pt-16 md:pt-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-7">
          <motion.h1
            {...fadeUp(0)}
            className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink md:text-5xl lg:text-6xl"
          >
            {dict.headlineLine1}
            <br />
            {dict.headlineLine2}
          </motion.h1>

          <motion.p
            {...fadeUp(0.1)}
            className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-soft"
          >
            {dict.subtext}
          </motion.p>

          <motion.div
            {...fadeUp(0.2)}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href={APP_URL}
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[15px] font-semibold text-accent-on shadow-[0_10px_30px_-12px_var(--accent)] transition-transform active:scale-[0.98]"
            >
              {dict.ctaPrimary}
              <ArrowRight
                weight="bold"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </a>
            <a
              href="#como-funciona"
              className="inline-flex items-center rounded-full border border-line px-7 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:bg-surface-tint"
            >
              {dict.ctaSecondary}
            </a>
          </motion.div>
        </div>

        <motion.div
          {...(reduce
            ? {}
            : {
                initial: { opacity: 0, scale: 0.96 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
              })}
          className="relative md:col-span-5"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-surface-tint">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Banaue_Rice_Terraces%2C_Ifugao.JPG/1280px-Banaue_Rice_Terraces%2C_Ifugao.JPG"
              alt={dict.imageAlt}
              fill
              priority
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
            />
            <span className="absolute bottom-3 right-3 rounded-full bg-black/40 px-3 py-1 text-[11px] text-white backdrop-blur-sm">
              {dict.imageCredit}
            </span>
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-line bg-surface px-5 py-4 shadow-xl shadow-black/5 sm:block">
            <p className="font-display text-2xl font-semibold tabular-nums text-ink">
              {dict.statValue}
            </p>
            <p className="text-[13px] text-ink-faint">{dict.statLabel}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
