import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SendRate",
  description: "Compare EUR→PHP money-transfer rates and never overpay.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-text-primary">
        {/* Mobile-first app shell — mirrors .app (max-width 480px) in the prototype. */}
        <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-bg">
          {children}
        </div>
      </body>
    </html>
  );
}
