import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { ConsentBanner } from "@/components/ConsentBanner";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Self-hosted via next/font: no render-blocking Google Fonts <link>, no CLS
// from late font swap. Same Inter weights the design system already uses.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s · SulitSend",
    default: "SulitSend — Compare Money Transfers",
  },
  description: "Compare EUR→PHP money transfer providers.",
  openGraph: {
    siteName: "SulitSend",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
