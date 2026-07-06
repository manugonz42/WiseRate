# T14 — Provider pages: metadata + internal linking

## Dependencies
- **Reads:** [provider-details](../modules/provider-details.md), `web/app/provider/[id]/page.tsx`, `web/lib/data/providers.ts`
- **Task deps:** T12 (metadata plumbing), T13 (corridor page to link back to)

## Used by
- Organic long-tail queries ("wise vs remitly philippines" class); corridor pages link here

## Goal
Make `/provider/[id]` pages indexable assets: per-provider metadata, breadcrumb JSON-LD, and two-way internal links with the corridor page and Compare.

## Pre-made decisions
- **Metadata** via `generateMetadata` in the server `page.tsx` (client component untouched): known `PROVIDERS` id → title `` `${name} Review — EUR→PHP Fees & Rates` ``, description = profile `description` truncated ~155 chars, canonical `/provider/${id}`.
- **Unknown ids keep today's product behavior** (generic profile renders) but get `robots: { index: false, follow: false }` and a generic title — the fallback must not create infinitely indexable URLs.
- **JSON-LD:** `BreadcrumbList` only (Home → Providers → name). **No AggregateRating/Review** — `userRating`/`reviewCount` are editorial, not verified ([corridors spec](../modules/corridors.md) rule applies site-wide).
- **Internal links** (added inside `ProviderDetailClient` where the layout allows, or a server-rendered strip above it): "Compare all EUR→PHP providers →" (`/compare`) and "Sending EUR to PHP? See the full guide →" (`/send/eur-to-php`, href from the corridors registry — don't hardcode).
- Provider routes are already in the sitemap (T12) — verify, don't duplicate.

## Steps
1. `generateMetadata` + noindex fallback in `app/provider/[id]/page.tsx`.
2. BreadcrumbList JSON-LD (server-rendered in `page.tsx`, not the client component).
3. Internal-link strip on the provider page; on the corridor page confirm provider links resolve (they were built in T13).
4. Update [provider-details](../modules/provider-details.md) Platform notes: web now has per-provider metadata + noindex fallback (one line). Check off T14 in plan README.

## Verify
View-source `/provider/wise`: title, canonical, breadcrumb JSON-LD. `/provider/doesnotexist`: `<meta name="robots" content="noindex, nofollow">` present, page still renders generic profile. Links navigate both ways. `npm test && npm run build && npm run lint`.

## Out of scope
Review/rating schema, per-provider OG images, comparison ("X vs Y") pages.
