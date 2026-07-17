"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
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
import { LanguageSelect } from "@/components/LanguageSelect";
import { SettingsButton } from "@/components/SettingsButton";
import { AccountButton } from "@/components/AccountButton";
import { Onboarding } from "@/components/Onboarding";
import { ReferralCapture } from "@/components/ReferralCapture";
import { Logomark } from "@/components/Logomark";

type Tab = {
  labelKey: string;
  icon: Icon;
  href: string;
};

// The full web tab bar — Profile/Settings/Premium/Referral are app-phase
// modules, not part of the web MVP (see docs/architecture/navigation.md).
// Mobile: fixed bottom tab bar. sm+: pills in the sticky translucent top
// header at every width (Home desktop is the only exception — see below).
const TAB_DEFS: Tab[] = [
  { labelKey: "nav.home", icon: House, href: "/home" },
  { labelKey: "nav.compare", icon: ArrowsLeftRight, href: "/compare" },
  { labelKey: "nav.analytics", icon: ChartLineUp, href: "/analytics" },
  { labelKey: "nav.alerts", icon: Bell, href: "/alerts" },
  { labelKey: "nav.promos", icon: Tag, href: "/promos" },
];

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // Home is the only tab with a bespoke desktop shell (docs/modules/home.md
  // redesign): an oversized ink hero panel + a light panel whose nav sits
  // top-right, palette 3 lime (#c8f135 / icon #f4ff1f) scoped via vars so it
  // never touches the token-driven mobile view. Every other tab uses the
  // mobile shell at every width: sticky translucent header with the tab pills
  // inline (no sidebar, no light panel) — docs/architecture/navigation.md.
  const isHome = pathname === "/home";
  const limeVars = {
    "--lime": "#c8f135",
    "--lime-icon": "#f4ff1f",
  } as React.CSSProperties;

  return (
    <SidebarSlotProvider>
      <ReferralCapture />
      <header
        className={`sticky top-0 z-10 border-b border-border bg-bg/90 backdrop-blur ${
          isHome ? "lg:hidden" : ""
        }`}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/home" className="flex items-center gap-2">
            <Logomark className="h-8 w-8 rounded-xs" />
            <span className="text-lg font-extrabold tracking-tight">
              sulitsend
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {TAB_DEFS.map((tab) => {
              const TabIcon = tab.icon;
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.labelKey}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition active:scale-[0.97] ${
                    active
                      ? "bg-primary text-primary-light"
                      : "text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  <TabIcon size={16} weight="fill" />
                  {t(tab.labelKey)}
                </Link>
              );
            })}
          </nav>
          <div
            className={`flex items-center gap-2 sm:hidden ${
              isHome ? "" : "lg:flex"
            }`}
          >
            {/* Brand element: "live" stays English in every locale — excluded
                from translation (docs/architecture/localization.md). */}
            <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-extrabold shadow">
              🇪🇺→🇵🇭
              <span
                className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary-dark"
                aria-hidden
              />
              {t("nav.live")}
            </span>
            <LanguageSelect />
            <SettingsButton />
            <AccountButton />
          </div>
        </div>
      </header>
      {/* Bottom padding clears the fixed mobile tab bar. Home lg+: hero + panel. */}
      <div
        style={isHome ? limeVars : undefined}
        className={
          isHome
            ? "pb-24 sm:pb-0 lg:mx-auto lg:flex lg:min-h-[100dvh] lg:max-w-[1180px] lg:items-stretch lg:gap-4 lg:px-4 lg:py-4"
            : "pb-24 sm:pb-0"
        }
      >
        {isHome ? (
          <aside
            aria-label="Sidebar"
            className="relative hidden shrink-0 flex-col overflow-hidden rounded-[24px] bg-primary p-9 shadow-elevated lg:flex lg:w-[46%]"
          >
            <Link href="/home" className="flex items-center gap-2.5">
              <Logomark className="h-9 w-9 rounded-[10px]" />
              <span className="text-xl font-extrabold tracking-tight text-bg">
                sulitsend
              </span>
            </Link>
            {/* Home teleports its hero (headline / chips / savings ring) here. */}
            <SidebarSlotTarget className="mt-9 flex flex-1 flex-col empty:hidden" />
          </aside>
        ) : null}
        <div
          className={
            isHome ? "lg:flex lg:min-w-0 lg:flex-1 lg:flex-col" : undefined
          }
        >
          {isHome ? (
            <div className="lg:flex lg:flex-1 lg:flex-col lg:rounded-[24px] lg:bg-surface-elevated lg:p-8">
              <nav
                aria-label="Main"
                className="mb-7 hidden items-center justify-between lg:flex"
              >
                <div className="flex items-center gap-1">
                  {TAB_DEFS.map((tab) => {
                    const active = isActive(tab.href);
                    return (
                      <Link
                        key={tab.labelKey}
                        href={tab.href}
                        aria-current={active ? "page" : undefined}
                        className={`rounded-full px-4 py-2 text-sm font-bold transition active:scale-[0.97] ${
                          active
                            ? "bg-primary text-[color:var(--lime)]"
                            : "text-text-secondary hover:bg-surface"
                        }`}
                      >
                        {t(tab.labelKey)}
                      </Link>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <SettingsButton />
                  <LanguageSelect />
                  <AccountButton />
                </div>
              </nav>
              {children}
            </div>
          ) : (
            children
          )}
          <footer
            className={`border-t border-border px-4 py-4 text-center text-xs text-text-tertiary sm:px-6 ${
              isHome ? "lg:mt-6 lg:border-0 lg:py-0" : ""
            }`}
          >
          {t("footer.copyright")} ·{" "}
          <Link href="/about" className="underline hover:text-text-secondary">
            {t("footer.about")}
          </Link>{" "}
          ·{" "}
          <Link
            href="/how-we-make-money"
            className="underline hover:text-text-secondary"
          >
            {t("footer.howWeMakeMoney")}
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="underline hover:text-text-secondary">
            {t("footer.terms")}
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="underline hover:text-text-secondary">
            {t("footer.privacy")}
          </Link>{" "}
          ·{" "}
          <Link href="/cookies" className="underline hover:text-text-secondary">
            {t("footer.cookies")}
          </Link>
          </footer>
        </div>
      </div>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[max(env(safe-area-inset-bottom),10px)] pt-2 sm:hidden"
      >
        <div className="grid grid-cols-5">
          {TAB_DEFS.map((tab) => {
            const TabIcon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.labelKey}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-extrabold transition active:scale-95 ${
                  active ? "text-primary" : "text-text-tertiary"
                }`}
              >
                <TabIcon size={22} weight={active ? "fill" : "regular"} />
                {t(tab.labelKey)}
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
      <Onboarding />
    </SidebarSlotProvider>
  );
}
