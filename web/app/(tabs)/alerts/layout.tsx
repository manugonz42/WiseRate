import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EUR→PHP Rate Alerts",
  description:
    "Set EUR→PHP rate alerts and get notified when the exchange rate hits your target, so you send money at the best time.",
  alternates: { canonical: "/alerts" },
};

export default function AlertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
