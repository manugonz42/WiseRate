import Link from "next/link";
import {
  ArrowsLeftRight,
  Bell,
  ChartLineUp,
  House,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/lib";

type Tab = {
  label: string;
  icon: Icon;
  href: string;
};

// The full web tab bar — Profile/Settings/Premium/Referral are app-phase
// modules, not part of the web MVP (see docs/architecture/navigation.md).
const TABS: Tab[] = [
  { label: "Home", icon: House, href: "/home" },
  { label: "Compare", icon: ArrowsLeftRight, href: "/compare" },
  { label: "Analytics", icon: ChartLineUp, href: "/analytics" },
  { label: "Alerts", icon: Bell, href: "/alerts" },
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
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  aria-label={tab.label}
                  className="text-primary hover:bg-surface-hover"
                >
                  <span className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium sm:px-3">
                    <Icon size={18} weight="fill" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-border px-4 py-4 text-center text-xs text-text-tertiary sm:px-6">
        © 2026 SulitSend · Independent comparison site, not a payment
        institution ·{" "}
        <Link href="/about" className="underline hover:text-text-secondary">
          About
        </Link>{" "}
        ·{" "}
        <Link
          href="/how-we-make-money"
          className="underline hover:text-text-secondary"
        >
          How we make money
        </Link>{" "}
        ·{" "}
        <Link href="/terms" className="underline hover:text-text-secondary">
          Terms
        </Link>{" "}
        ·{" "}
        <Link href="/privacy" className="underline hover:text-text-secondary">
          Privacy
        </Link>{" "}
        ·{" "}
        <Link href="/cookies" className="underline hover:text-text-secondary">
          Cookies
        </Link>
      </footer>
    </>
  );
}
