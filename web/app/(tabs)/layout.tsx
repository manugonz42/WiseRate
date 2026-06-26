import { TabBar } from "@/components/TabBar";

// Shell shared by the 5 bottom-tab routes (home, compare, analytics, alerts,
// profile). Pushed routes (provider/[id], onboarding) live outside this group.
export default function TabsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <main className="pb-[88px]">{children}</main>
      <TabBar />
    </>
  );
}
