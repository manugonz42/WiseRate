"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/consent";
import { initAnalytics } from "@/lib/analytics";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
  }, []);

  if (!visible) return null;

  const choose = (state: "granted" | "denied") => {
    setConsent(state);
    if (state === "granted") initAnalytics();
    setVisible(false);
  };

  return (
    // Sits above the fixed mobile tab bar (see app/(tabs)/layout.tsx).
    <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-20 border-t border-border bg-surface-elevated px-4 py-4 shadow-elevated sm:bottom-0 sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          We use product analytics to improve SulitSend. See our{" "}
          <Link href="/cookies" className="text-primary underline">
            cookie notice
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose("denied")}
            className="rounded-full bg-surface px-4 py-2 text-xs font-semibold text-text-secondary transition hover:bg-surface-hover active:scale-[0.97]"
          >
            Decline
          </button>
          <button
            onClick={() => choose("granted")}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-light transition active:scale-[0.97]"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
