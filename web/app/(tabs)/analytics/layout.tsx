import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EUR→PHP Exchange Rate Trends",
  description:
    "Track EUR→PHP exchange rate trends over 7 and 30 days to time your money transfer to the Philippines.",
  alternates: { canonical: "/analytics" },
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
