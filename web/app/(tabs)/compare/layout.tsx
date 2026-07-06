import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare EUR→PHP Transfer Providers — Live Rates",
  description:
    "Live EUR→PHP rates across Wise, Remitly, Western Union, and TransferGo — compare fees, markup, speed, and trust side by side.",
  alternates: { canonical: "/compare" },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
