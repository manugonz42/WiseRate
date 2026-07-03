"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getConsent } from "@/lib/consent";
import { initAnalytics, capturePageview } from "@/lib/analytics";

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (getConsent() === "granted") initAnalytics();
  }, []);

  useEffect(() => {
    if (getConsent() !== "granted") return;
    const query = searchParams.toString();
    capturePageview(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  return null;
}
