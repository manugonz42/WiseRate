import Image from "next/image";
import { APP_URL } from "@/lib/config";
import type { Dictionary } from "@/lib/i18n/dictionary";

export function FinalCTA({ dict }: { dict: Dictionary["cta"] }) {
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-6 py-24">
      <div className="relative isolate overflow-hidden rounded-[32px] px-8 py-20 text-center sm:px-16">
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Chocolate_Hills_Bohol.JPG/1280px-Chocolate_Hills_Bohol.JPG"
          alt={dict.imageAlt}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/55 to-black/30" />

        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
            {dict.title}
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] leading-relaxed text-white/80">
            {dict.subtitle}
          </p>
          <a
            href={APP_URL}
            className="mt-8 inline-flex items-center rounded-full bg-accent px-8 py-3.5 text-[15px] font-semibold text-accent-on transition-transform active:scale-[0.98]"
          >
            {dict.cta}
          </a>
        </div>

        <span className="absolute bottom-3 right-3 rounded-full bg-black/40 px-3 py-1 text-[11px] text-white backdrop-blur-sm">
          {dict.imageCredit}
        </span>
      </div>
    </section>
  );
}
