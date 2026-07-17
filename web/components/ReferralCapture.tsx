"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { captureReferralCode } from "@/lib/services/persistence";
import { track } from "@/lib/analytics";

function ReferralCaptureInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && captureReferralCode(ref)) {
      track("referral.link_captured");
    }
  }, [searchParams]);

  return null;
}

// Captures `?ref=` on every tab route (T36, docs/modules/referral.md). Lives
// in the tabs layout rather than middleware so pages stay static/cacheable;
// Suspense-wrapped since useSearchParams forces its subtree to render
// dynamically (same pattern as the signup page).
export function ReferralCapture() {
  return (
    <Suspense fallback={null}>
      <ReferralCaptureInner />
    </Suspense>
  );
}
