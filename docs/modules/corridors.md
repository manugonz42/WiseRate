# Module: Corridor pages (SEO)

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md) (server-side `getAggregatedQuotes`), [provider-details](provider-details.md) (internal links), [design-system](../architecture/design-system.md)
- **Future:** ⏳ Compare screen accepting a `from` currency param (today Compare is EUR→PHP only), ⏳ es/tl localization

## Used by
- [ROADMAP](../ROADMAP.md) Phase 5 SEO (pulled forward — executed as T12–T16, see [plan/](../plan/README.md))
- Organic acquisition: these pages are the SEO entry points that feed affiliate/broker clicks

## Purpose

Server-rendered, indexable landing pages per remittance corridor (`/send/eur-to-php` first). Each page combines a live comparison snapshot with editorial content and FAQ — enough unique value to rank, with CTAs into the app and to provider pages.

## Contract

- **Route:** `web/app/send/[corridor]/page.tsx` — `generateStaticParams` from the registry, `dynamicParams = false` (unknown slug → 404), `revalidate = 3600` (hourly ISR; quote fetch failure keeps the stale page or renders editorial-only on first build).
- **Registry:** `web/lib/data/corridors.ts` — `{ slug, from, to, fromLabel, toLabel, defaultAmount, title, metaDescription, intro, faq }`. Adding a corridor = one registry entry; sitemap and static params derive from it.
- **Enablement rule:** a corridor ships only if a live `getAggregatedQuotes(from, to, defaultAmount)` returns **≥3 distinct providers** (verification harness in T16). Record pass/fail here when run.
- **Snapshot table:** top 5 quotes by `receiveAmount` for `defaultAmount` (€/£/$1,000), server-rendered — provider · rate · fee · recipient gets, each provider linking `/provider/[id]`.
- **Structured data:** `FAQPage` + `BreadcrumbList` JSON-LD. **Never emit `AggregateRating`/`Review` schema** — our ratings are editorial, not verified reviews (manual-action risk).
- **Style:** app tokens, `max-w-4xl`, content-dense utility layout — no landing-page hero patterns ([platforms/web](../platforms/web.md)).
- **CTA:** `/compare` only on corridors Compare actually supports (EUR→PHP today); other corridors' utility is the snapshot table itself + provider links.

## Acceptance criteria

- [x] `/send/eur-to-php` renders statically with live snapshot, FAQ, JSON-LD, canonical URL
- [x] Unknown slugs 404; every registry corridor appears in `sitemap.xml`
- [x] Page builds even when all quote sources fail (editorial fallback)
- [ ] Corridors enabled beyond EUR→PHP pass the ≥3-provider harness

## Corridor status

| Corridor | Slug | Status |
|---|---|---|
| EUR→PHP | `eur-to-php` | ◐ (T13) |
| GBP→PHP / USD→PHP / CAD→PHP / AUD→PHP | — | candidates, gated on harness (T16) |
