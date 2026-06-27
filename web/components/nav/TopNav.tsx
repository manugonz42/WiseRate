"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { TABS } from "./tabs";

// Desktop top nav — shown at `md+`; the mobile bottom bar handles `< md`.
export function TopNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 hidden border-b border-border bg-bg/80 backdrop-blur md:block">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center gap-xl px-xxl">
        <Link href="/home" className="text-title3 font-extrabold tracking-tight">
          WiseRate
        </Link>
        <div className="flex items-center gap-lg">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-subhead font-medium transition-colors duration-quick ease-standard",
                  active ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
