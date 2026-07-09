import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promos — SulitSend",
  description: "Discover all available promos and special offers from our providers.",
};

export default function PromosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
