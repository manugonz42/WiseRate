import type { Metadata } from "next";
import { TopNav } from "@/components/nav/TopNav";
import { MobileTabBar } from "@/components/nav/MobileTabBar";

// App surfaces are not public landing pages — keep them out of the index.
// The indexable entry is the marketing landing at `/` (see seo.md).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Full-web responsive shell: top nav on desktop, bottom tab bar on mobile.
// Content is centered and fluid up to max-w-6xl (see design-system.md#breakpoints).
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <TopNav />
      <main className="mx-auto w-full max-w-6xl pb-[72px] md:pb-0">{children}</main>
      <MobileTabBar />
    </div>
  );
}
