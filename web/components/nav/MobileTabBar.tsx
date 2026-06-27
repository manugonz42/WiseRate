"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { TABS } from "./tabs";

// Mobile bottom tab bar — shown only at `< md`; desktop uses TopNav.
export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex items-stretch border-t border-border bg-surface/95 backdrop-blur md:hidden">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-xs py-md text-caption2 transition-colors duration-quick ease-standard",
              active ? "text-primary-light" : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            <span className="text-[18px] leading-none">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
