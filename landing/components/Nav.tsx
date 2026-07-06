import Link from "next/link";
import { Logomark } from "./Logomark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { APP_URL } from "@/lib/config";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function Nav({ dict, locale }: { dict: Dictionary["nav"]; locale: Locale }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <Logomark className="h-8 w-8" />
          <span className="font-display text-[17px] font-semibold tracking-tight text-ink">
            SulitSend
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <a
            href="#como-funciona"
            className="text-[14px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            {dict.how}
          </a>
          <a
            href="#comparativa"
            className="text-[14px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            {dict.comparison}
          </a>
          <a
            href="#preguntas"
            className="text-[14px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            {dict.faq}
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher locale={locale} />
          </div>
          <a
            href={APP_URL}
            className="whitespace-nowrap rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-accent-on transition-transform active:scale-[0.98] sm:px-5 sm:py-2.5 sm:text-[14px]"
          >
            {dict.cta}
          </a>
        </div>
      </div>
    </header>
  );
}
