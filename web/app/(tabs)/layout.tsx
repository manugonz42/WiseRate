"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowsLeftRight,
  Bell,
  ChartLineUp,
  House,
  Tag,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react/lib";
import {
  SidebarSlotProvider,
  SidebarSlotTarget,
} from "@/components/SidebarSlot";

type Tab = {
  label: string;
  icon: Icon;
  href: string;
};

// The full web tab bar — Profile/Settings/Premium/Referral are app-phase
// modules, not part of the web MVP (see docs/architecture/navigation.md).
// Mobile: fixed bottom tab bar. sm–lg: pills in the top header.
// lg+: sticky ink sidebar with a per-page portal slot (SidebarSlot).
const TABS: Tab[] = [
  { label: "Home", icon: House, href: "/home" },
  { label: "Compare", icon: ArrowsLeftRight, href: "/compare" },
  { label: "Analytics", icon: ChartLineUp, href: "/analytics" },
  { label: "Alerts", icon: Bell, href: "/alerts" },
  { label: "Promos", icon: Tag, href: "/promos" },
];

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Home gets the wide split-hero desktop shell (docs/modules/home.md redesign):
  // an oversized ink hero panel + a light panel whose nav sits top-right. Other
  // tabs keep the narrow sticky sidebar (nav inside it). Mobile is identical for
  // all tabs. Palette 3 lime (#c8f135 / icon #f4ff1f) is scoped here via vars so
  // it never touches the token-driven mobile view.
  const isHome = pathname === "/home";
  const limeVars = {
    "--lime": "#c8f135",
    "--lime-icon": "#f4ff1f",
  } as React.CSSProperties;

  return (
    <SidebarSlotProvider>
      <header className="sticky top-0 z-10 border-b border-border bg-bg/90 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/home" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xs bg-gradient-to-br from-primary-light to-chartreuse text-base font-extrabold text-primary shadow-[0_3px_0_var(--primary)]">
              ₱
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              sulitsend
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {TABS.map((tab) => {
              const TabIcon = tab.icon;
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition active:scale-[0.97] ${
                    active
                      ? "bg-primary text-primary-light"
                      : "text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  <TabIcon size={16} weight="fill" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-extrabold shadow sm:hidden">
            🇪🇺→🇵🇭
            <span
              className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary-dark"
              aria-hidden
            />
            live
          </span>
        </div>
      </header>
      {/* Bottom padding clears the fixed mobile tab bar. lg+: sidebar + content. */}
      <div
        style={isHome ? limeVars : undefined}
        className={
          isHome
            ? "pb-24 sm:pb-0 lg:mx-auto lg:flex lg:min-h-[100dvh] lg:max-w-[1180px] lg:items-stretch lg:gap-4 lg:px-4 lg:py-4"
            : "pb-24 sm:pb-0 lg:mx-auto lg:flex lg:min-h-[100dvh] lg:max-w-6xl lg:items-start lg:gap-6 lg:px-6 lg:pb-8 lg:pt-6"
        }
      >
        {isHome ? (
          <aside
            aria-label="Sidebar"
            className="relative hidden shrink-0 flex-col overflow-hidden rounded-[24px] bg-primary p-9 shadow-elevated lg:flex lg:w-[46%]"
          >
            <Link href="/home" className="flex items-center gap-2.5">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-lg font-extrabold text-primary"
                style={{ background: "var(--lime-icon)" }}
              >
                ₱
              </span>
              <span className="text-xl font-extrabold tracking-tight text-bg">
                sulitsend
              </span>
            </Link>
            {/* Home teleports its hero (headline / chips / savings ring) here. */}
            <SidebarSlotTarget className="mt-9 flex flex-1 flex-col empty:hidden" />
          </aside>
        ) : (
          <aside
            aria-label="Sidebar"
            className="sticky top-6 hidden max-h-[calc(100dvh-3rem)] w-[280px] shrink-0 flex-col gap-5 overflow-y-auto rounded bg-primary p-5 shadow-elevated lg:flex"
          >
            <div className="flex items-center justify-between gap-2">
              <Link href="/home" className="flex min-w-0 items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xs bg-gradient-to-br from-primary-light to-chartreuse text-base font-extrabold text-primary">
                  ₱
                </span>
                <span className="truncate text-lg font-extrabold tracking-tight text-bg">
                  sulitsend
                </span>
              </Link>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold text-bg">
                🇪🇺→🇵🇭
                <span
                  className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary-light"
                  aria-hidden
                />
                live
              </span>
            </div>
            <nav aria-label="Main" className="flex flex-col gap-1.5">
              {TABS.map((tab) => {
                const TabIcon = tab.icon;
                const active = isActive(tab.href);
                return (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-sm px-4 py-2.5 text-sm font-extrabold transition active:scale-[0.98] ${
                      active
                        ? "chip-pop bg-primary-light text-primary"
                        : "text-bg opacity-75 hover:bg-white/10 hover:opacity-100"
                    }`}
                  >
                    <TabIcon size={18} weight="fill" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
            {/* Page-owned controls. Hidden when empty. */}
            <SidebarSlotTarget className="flex flex-col gap-5 border-t border-white/15 pt-5 empty:hidden" />
          </aside>
        )}
        <div
          className={
            isHome
              ? "lg:flex lg:min-w-0 lg:flex-1 lg:flex-col"
              : "lg:min-w-0 lg:flex-1"
          }
        >
          {isHome ? (
            <div className="lg:flex lg:flex-1 lg:flex-col lg:rounded-[24px] lg:bg-surface-elevated lg:p-8">
              <nav
                aria-label="Main"
                className="mb-7 hidden items-center justify-end gap-1 lg:flex"
              >
                {TABS.map((tab) => {
                  const active = isActive(tab.href);
                  return (
                    <Link
                      key={tab.label}
                      href={tab.href}
                      aria-current={active ? "page" : undefined}
                      className={`rounded-full px-4 py-2 text-sm font-bold transition active:scale-[0.97] ${
                        active
                          ? "bg-primary text-[color:var(--lime)]"
                          : "text-text-secondary hover:bg-surface"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </nav>
              {children}
            </div>
          ) : (
            children
          )}
          <footer className="border-t border-border px-4 py-4 text-center text-xs text-text-tertiary sm:px-6 lg:mt-6 lg:border-0 lg:py-0">
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
        </div>
      </div>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[max(env(safe-area-inset-bottom),10px)] pt-2 sm:hidden"
      >
        <div className="grid grid-cols-5">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.label}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-extrabold transition active:scale-95 ${
                  active ? "text-primary" : "text-text-tertiary"
                }`}
              >
                <TabIcon size={22} weight={active ? "fill" : "regular"} />
                {tab.label}
                <span
                  className={`h-1 w-1 rounded-full ${
                    active ? "bg-primary-dark" : "bg-transparent"
                  }`}
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </SidebarSlotProvider>
  );
}
