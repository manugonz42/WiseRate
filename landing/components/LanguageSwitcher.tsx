"use client";

import { useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";

export function LanguageSwitcher({
  locale,
  variant = "nav",
}: {
  locale: Locale;
  variant?: "nav" | "footer";
}) {
  const router = useRouter();

  function switchTo(next: Locale) {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
    router.push(`/${next}`);
  }

  if (variant === "footer") {
    return (
      <ul className="mt-4 flex flex-col gap-3 text-[14px]">
        {locales.map((loc) => (
          <li key={loc}>
            <button
              onClick={() => switchTo(loc)}
              aria-current={loc === locale}
              className={
                loc === locale
                  ? "font-semibold text-ink"
                  : "text-ink-soft hover:text-ink"
              }
            >
              {localeNames[loc]}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-line p-1">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchTo(loc)}
          aria-current={loc === locale}
          className={`rounded-full px-2.5 py-1 text-[12px] font-semibold uppercase transition-colors ${
            loc === locale
              ? "bg-accent text-accent-on"
              : "text-ink-faint hover:text-ink"
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
