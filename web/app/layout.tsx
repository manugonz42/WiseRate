import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Suspense } from "react";
import { ConsentBanner } from "@/components/ConsentBanner";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { I18nProvider } from "@/components/I18nProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Self-hosted via next/font: no render-blocking Google Fonts <link>, no CLS
// from late font swap. Outfit is the Pistacho design-system family.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-outfit",
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
    <html lang="en" className={outfit.variable}>
      <body>
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        {/* Root-level provider so ConsentBanner (and any route) has an
            initialized i18n instance — see docs/architecture/localization.md */}
        <I18nProvider>
          {children}
          <ConsentBanner />
        </I18nProvider>
      </body>
    </html>
  );
}
