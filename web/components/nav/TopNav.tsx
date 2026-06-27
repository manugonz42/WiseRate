"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { TABS } from "./tabs";

// Desktop top nav — shown at `md+`; the mobile bottom bar handles `< md`.
// Logo returns to the public landing; active tab carries an underline.
export function TopNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 hidden border-b border-border bg-bg/80 backdrop-blur md:block">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center gap-xl px-xxl">
        <Link href="/" className="text-title3 font-extrabold tracking-tight">
          WiseRate
        </Link>
        <div className="flex items-center gap-lg">
          {TABS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-xs text-subhead font-medium transition-colors duration-quick ease-standard",
                  active ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary",
                )}
              >
                {label}
                {active && (
                  <span className="absolute inset-x-0 -bottom-[17px] h-[2px] rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
