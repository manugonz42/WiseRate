import { Logomark } from "./Logomark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { APP_URL } from "@/lib/config";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function Footer({
  dict,
  locale,
}: {
  dict: Dictionary["footer"];
  locale: Locale;
}) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logomark className="h-7 w-7" />
              <span className="font-display text-[16px] font-semibold text-ink">
                SulitSend
              </span>
            </div>
            <p className="mt-4 max-w-[38ch] leading-relaxed text-ink-faint">
              {dict.description}
            </p>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
              {dict.productLabel}
            </p>
            <ul className="mt-4 space-y-3 text-[14px]">
              <li>
                <a href={APP_URL} className="text-ink-soft hover:text-ink">
                  {dict.compareLabel}
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="text-ink-soft hover:text-ink">
                  {dict.howLabel}
                </a>
              </li>
              <li>
                <a href="#preguntas" className="text-ink-soft hover:text-ink">
                  {dict.faqLabel}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-ink-faint">
              {dict.languageLabel}
            </p>
            <LanguageSwitcher locale={locale} variant="footer" />
          </div>
        </div>

        <div className="mt-14 border-t border-line pt-6 text-[13px] text-ink-faint">
          {dict.copyright}
        </div>
      </div>
    </footer>
  );
}
