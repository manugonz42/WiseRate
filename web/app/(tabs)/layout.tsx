import Link from "next/link";
import {
  ArrowsLeftRight,
  Bell,
  ChartLineUp,
  House,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/lib";

type Tab = {
  label: string;
  icon: Icon;
  href?: string;
};

// Home + Compare are ported to web/ so far — see docs/MODULES.md.
// The rest render disabled instead of linking to a page that doesn't exist yet.
const TABS: Tab[] = [
  { label: "Home", icon: House, href: "/home" },
  { label: "Compare", icon: ArrowsLeftRight, href: "/compare" },
  { label: "Analytics", icon: ChartLineUp },
  { label: "Alerts", icon: Bell },
  { label: "Profile", icon: UserCircle },
];

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-base font-extrabold tracking-tight">
            SulitSend
          </span>
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = Boolean(tab.href);
              const content = (
                <span className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium sm:px-3">
                  <Icon size={18} weight={active ? "fill" : "regular"} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              );
              return tab.href ? (
                <Link
                  key={tab.label}
                  href={tab.href}
                  aria-label={tab.label}
                  className="text-primary hover:bg-surface-hover"
                >
                  {content}
                </Link>
              ) : (
                <span
                  key={tab.label}
                  aria-disabled="true"
                  aria-label={tab.label}
                  className="cursor-not-allowed text-text-tertiary opacity-50"
                >
                  {content}
                </span>
              );
            })}
          </nav>
        </div>
      </header>
      {children}
    </>
  );
}
