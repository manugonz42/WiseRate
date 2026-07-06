import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Money Transfers to the Philippines",
  description:
    "Compare EUR→PHP money transfer providers by rate, fee, and speed to find the best deal for sending money to the Philippines.",
  alternates: { canonical: "/home" },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
