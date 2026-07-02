# T10 — Product analytics wiring (PostHog)

## Dependencies
- **Reads:** [analytics service](../services/analytics.md) (event-tracking contract), module specs' named events (see list below)
- **Task deps:** T09 (consent gate); human must create the PostHog project for prod keys (works as no-op without)

## Used by
- Every module's `analytics:` events; conversion measurement for the affiliate/broker revenue flow

## Goal
One `track()` helper wired to PostHog (EU), consent-gated, replacing the `console.info("analytics: ...")` stubs.

## Pre-made decisions
- `npm i posthog-js`. Init only when `NEXT_PUBLIC_POSTHOG_KEY` is set **and** consent is `"granted"`; host from `NEXT_PUBLIC_POSTHOG_HOST` (default `https://eu.i.posthog.com`). No key or no consent → `track()` logs to console in dev, no-ops in prod.
- `web/lib/analytics.ts`: `track(event: string, props?: Record<string, unknown>)` + `initAnalytics()` called from a small client component in `web/app/layout.tsx` (after consent). Disable autocapture and session recording; page views on route change only. `capture_pageview` manual via Next router events.
- Event names come from the specs — wire exactly these where the screens already stub them:
  `compare.affiliate_outbound` · `compare.sort_changed` · `compare.broker_outbound` · `provider.affiliate_outbound` · `analytics.timeframe_changed` · `home.sponsored_tapped` (leave unfired — no sponsored inventory) · plus `premium.*` names stay unwired (no premium on web).
- `.env.example` in `web/` documenting both vars.

## Steps
1. Build `analytics.ts` + init component; replace every `console.info("analytics: ...")` stub across `web/app/**` with `track(...)` (grep for `analytics:` to find them all).
2. If Compare's affiliate "Send" CTA doesn't yet fire an event, add `compare.affiliate_outbound { providerID }` there (spec: [comparison](../modules/comparison.md) Outputs).
3. Update `docs/services/analytics.md` status line: web = wired (PostHog, consent-gated); update [MODULES.md](../MODULES.md) services table accordingly. Check off T10.

## Verify
Without env key: no network calls, dev console logs events on CTA clicks/sort/timeframe. With a test key + consent granted: events appear in PostHog Live. Declining consent → zero PostHog traffic. `npm run build && npm run lint`.

## Out of scope
Dashboards/funnels, iOS/Android analytics, A/B testing, cookie-based attribution beyond PostHog defaults.
