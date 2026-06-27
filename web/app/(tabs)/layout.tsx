import { TabBar } from "./TabBar";

// Phone-width column centered on larger screens — the app is mobile-first.
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-md pb-[72px]">
      {children}
      <TabBar />
    </div>
  );
}
