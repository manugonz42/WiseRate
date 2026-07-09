import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Customize your preferences: language, default send amount, and provider accounts.",
  alternates: { canonical: "/settings" },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
