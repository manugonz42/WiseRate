"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

// Mirrors iOS/Android TabItem ordering.
const TABS = [
  { href: "/home", label: "Home", icon: "⌂" },
  { href: "/compare", label: "Compare", icon: "⟷" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md items-stretch border-t border-border bg-surface/95 backdrop-blur">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
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
