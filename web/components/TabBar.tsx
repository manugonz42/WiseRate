"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 5-tab bar — mirrors docs/architecture/navigation.md.
const TABS = [
  { href: "/home", label: "Home", icon: "M3 11l9-8 9 8M5 10v10h14V10" },
  { href: "/compare", label: "Compare", icon: "M7 7h14M7 7l4-4M7 7l4 4M17 17H3M17 17l-4-4M17 17l-4 4" },
  { href: "/analytics", label: "Analytics", icon: "M3 3v18h18M7 15l4-5 3 3 5-7" },
  { href: "/alerts", label: "Alerts", icon: "M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8M10.3 21a2 2 0 003.4 0" },
  { href: "/profile", label: "Profile", icon: "M4 21a8 8 0 0116 0M12 11a4 4 0 100-8 4 4 0 000 8" },
] as const;

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-[480px] border-t border-border bg-surface/95 backdrop-blur">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-1 py-[var(--space-md)] text-[11px] ${
              active ? "text-primary" : "text-text-tertiary"
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={tab.icon} />
            </svg>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
