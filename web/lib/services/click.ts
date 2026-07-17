// Outbound-click resolution for T37 (docs/services/referral.md) — split from
// the /api/click route so it's testable without mocking Supabase. Resolves a
// providerID/brokerID to its live URL + sub-ID param without trusting a
// client-submitted URL (avoids an open-redirect: the route only ever
// forwards to a URL it looked up itself).

import { PROVIDERS } from "@/lib/data/providers";
import { BROKERS } from "@/lib/brokers";

export interface ClickTarget {
  url: string;
  subIdParam?: string;
}

export function resolveClickTarget(providerId: string): ClickTarget | null {
  const provider = PROVIDERS[providerId];
  if (provider) {
    const url = provider.affiliateURL ?? provider.websiteURL;
    if (!url) return null;
    return { url, subIdParam: provider.subIdParam };
  }

  const broker = BROKERS.find((b) => b.id === providerId);
  if (broker) return { url: broker.url, subIdParam: broker.subIdParam };

  return null;
}

// Appends the network's sub-ID param with the click id so its conversion
// report can be traced back to this click. Providers without a known param
// (subIdParam unset) get the plain URL — click row + funnel data still
// exist, just no reward is possible (docs/plan/T37-referral-rewards.md).
export function appendClickRef(url: string, subIdParam: string | undefined, clickId: string): string {
  if (!subIdParam) return url;
  try {
    const u = new URL(url);
    u.searchParams.set(subIdParam, clickId);
    return u.toString();
  } catch {
    return url;
  }
}
