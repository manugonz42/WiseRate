import type { Icon } from "@phosphor-icons/react";
import { ArrowsLeftRight, Bell, ChartLineUp, House, User } from "@phosphor-icons/react";

// Shared nav destinations — mirrors iOS/Android TabItem ordering and the
// navigation.md tab table. Consumed by TopNav (desktop) and MobileTabBar (mobile).
export const TABS: { href: string; label: string; Icon: Icon }[] = [
  { href: "/home", label: "Home", Icon: House },
  { href: "/compare", label: "Compare", Icon: ArrowsLeftRight },
  { href: "/analytics", label: "Analytics", Icon: ChartLineUp },
  { href: "/alerts", label: "Alerts", Icon: Bell },
  { href: "/profile", label: "Profile", Icon: User },
];
