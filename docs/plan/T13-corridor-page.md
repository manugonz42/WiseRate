# T13 — Corridor SEO page: EUR→PHP

## Dependencies
- **Reads:** [corridors](../modules/corridors.md) (contract — binding), [exchange-rate](../services/exchange-rate.md), `web/lib/services/quotes.ts`, `web/lib/data/providers.ts`
- **Task deps:** T12 (SITE_URL, sitemap, metadata plumbing)

## Used by
- [MODULES.md](../MODULES.md) Corridor pages row; T16 adds more corridors on this template

## Goal
Ship `/send/eur-to-php`: server-rendered corridor landing page per the corridors spec — live snapshot table, editorial content, FAQ, JSON-LD.

## Pre-made decisions
- **Registry first:** create `web/lib/data/corridors.ts` with the contract shape from the spec; single entry `eur-to-php` (`from: "EUR"`, `to: "PHP"`, `defaultAmount: 1000`).
- **Rendering:** `app/send/[corridor]/page.tsx` server component. `generateStaticParams` from registry, `export const dynamicParams = false`, `export const revalidate = 3600`. Call `getAggregatedQuotes(from, to, defaultAmount)` **directly** (no internal HTTP). Wrap in try/catch — on failure render the page without the snapshot table (a "see live comparison" link instead); never fail the build.
- **Page sections, in order:** breadcrumb (Home → Send EUR to PHP) · H1 `Send Money from Europe to the Philippines (EUR → PHP)` · intro paragraphs from registry · snapshot table (top 5 by `receiveAmount`: Provider · Rate · Fee · Recipient gets; provider name links `/provider/[id]`; footnote "Snapshot for €1,000, refreshed hourly") · CTA button → `/compare` ("Compare live rates") · short per-provider blurbs (reuse `PROVIDERS` descriptions, first ~2 sentences) · FAQ.
- **FAQ content** (write into registry, en): 5 entries covering — cheapest way to send EUR→PHP; how long transfers take; what the mid-market rate/markup means; cash pickup vs bank deposit in PH; whether SulitSend charges anything (no — affiliate disclosure, honest). Answers 2–4 sentences, factual, sourced from provider profiles/parsers knowledge.
- **JSON-LD:** one `<script type="application/ld+json">` each for `FAQPage` (from registry FAQ) and `BreadcrumbList`. **No AggregateRating/Review** (spec rule).
- **Metadata:** `generateMetadata` from registry `title`/`metaDescription`; canonical `/send/eur-to-php`.
- **Chrome:** page lives outside `(tabs)`. Reuse the existing footer (T09) if it's a shared component; add a minimal top bar: SulitSend wordmark linking `/home`. Don't force the tab nav.
- **Style:** dark tokens, `max-w-4xl`, content-dense; **no hero/marquee patterns** ([platforms/web](../platforms/web.md)).
- **Sitemap:** import the registry in `app/sitemap.ts`, emit `/send/${slug}` for every corridor.
- **Test:** vitest unit test validating the registry (unique slugs, `faq.length >= 4`, non-empty intro/metaDescription) so T16 additions stay honest.

## Steps
1. Registry + test.
2. Page + JSON-LD + metadata.
3. Sitemap wiring.
4. Update [corridors spec](../modules/corridors.md): EUR→PHP status → ◐, tick acceptance boxes that now hold.
5. Update [MODULES.md](../MODULES.md): Corridor pages / Web → ◐. Check off T13 in plan README.

## Verify
`npm run dev` → `/send/eur-to-php` renders table + FAQ; `/send/nope` → 404. View-source: FAQPage JSON-LD valid (paste into a JSON parser), canonical present. `/sitemap.xml` includes the corridor. `npm test && npm run build && npm run lint` — confirm the route shows as ISR/static in build output.

## Out of scope
Corridors beyond EUR→PHP (T16), Compare accepting a `from` param, localization of corridor copy.
