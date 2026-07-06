// Product analytics — PostHog (EU), consent-gated (docs/services/analytics.md).
// No key or no consent: track() logs to console in dev, no-ops in prod.

import posthog from "posthog-js";
import { getConsent } from "@/lib/consent";

let initialized = false;

function readyToInit(): boolean {
  return (
    typeof window !== "undefined" &&
    !initialized &&
    !!process.env.NEXT_PUBLIC_POSTHOG_KEY &&
    getConsent() === "granted"
  );
}

export function initAnalytics(): void {
  if (!readyToInit()) return;
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
  });
  initialized = true;
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || getConsent() !== "granted") {
    if (process.env.NODE_ENV !== "production") {
      console.info(`analytics: ${event}`, props);
    }
    return;
  }
  if (!initialized) initAnalytics();
  posthog.capture(event, props);
}

export function capturePageview(url: string): void {
  if (typeof window === "undefined" || !initialized) return;
  posthog.capture("$pageview", { $current_url: url });
}
