// Shared nav destinations — mirrors iOS/Android TabItem ordering and the
// navigation.md tab table. Consumed by TopNav (desktop) and MobileTabBar (mobile).
export const TABS = [
  { href: "/home", label: "Home", icon: "⌂" },
  { href: "/compare", label: "Compare", icon: "⟷" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/alerts", label: "Alerts", icon: "🔔" },
  { href: "/profile", label: "Profile", icon: "👤" },
] as const;
