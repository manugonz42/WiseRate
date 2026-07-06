# T12 — SEO foundation (web app)

## Dependencies
- **Reads:** [platforms/web](../platforms/web.md), `web/app/layout.tsx`, `web/lib/data/providers.ts`
- **Task deps:** none (first task of the SEO slice)

## Used by
- T13–T14 (canonical/OG/sitemap plumbing), every indexable web page

## Goal
Give `web/` real SEO plumbing: metadataBase + title template, per-page metadata, OG image, `robots.txt`, `sitemap.xml`, canonical URLs.

## Pre-made decisions
- **Site URL:** new `web/lib/site.ts` exporting `SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.sulitsend.app"`. Use it everywhere (metadataBase, sitemap, robots, JSON-LD later).
- **Tab pages are client components — do NOT convert them.** Add a tiny server `layout.tsx` per tab segment (`app/(tabs)/{home,compare,analytics,alerts}/layout.tsx`) that only exports `metadata` and returns `children`. Same trick for any other client page needing metadata.
- **Titles** use root template `%s · SulitSend`; root default stays `SulitSend — Compare Money Transfers`. Per page: Home → `Compare Money Transfers to the Philippines`; Compare → `Compare EUR→PHP Transfer Providers — Live Rates`; Analytics → `EUR→PHP Exchange Rate Trends`; Alerts → `EUR→PHP Rate Alerts`. Descriptions ~150 chars, mention EUR→PHP, no keyword stuffing.
- **OG image:** `app/opengraph-image.tsx` with `next/og` `ImageResponse` — dark background using design-system surface color, "SulitSend" wordmark + "Compare EUR→PHP money transfers" tagline. No external fetches/assets. Next reuses it for Twitter; set `twitter: { card: "summary_large_image" }` in root metadata.
- **robots.ts:** allow all, `disallow: ["/api/"]`, point to `${SITE_URL}/sitemap.xml`.
- **sitemap.ts:** static routes (`/home`, `/compare`, `/analytics`, `/alerts`, `/privacy`, `/cookies`) + `/provider/${id}` for every key of `PROVIDERS`. Structure it so T13 can append corridor routes from a registry import.
- **Canonical:** `alternates: { canonical: "/<route>" }` in each segment's metadata (relative — metadataBase resolves it). Root `/` redirects to `/home`, so no canonical needed there.
- `/privacy` and `/cookies` are server components — add/extend their `metadata` exports directly (title + canonical; keep them indexable).

## Steps
1. Create `web/lib/site.ts`; extend root `app/layout.tsx` metadata (metadataBase, title template, description, openGraph siteName/type, twitter card).
2. Add `app/opengraph-image.tsx`.
3. Add the four per-tab `layout.tsx` metadata shims; extend privacy/cookies metadata.
4. Add `app/robots.ts` and `app/sitemap.ts`.
5. Document `NEXT_PUBLIC_SITE_URL` in `web/.env.example` (create if missing) and in [platforms/web](../platforms/web.md) (one line under Stack).
6. Update [plan/README](README.md): check off T12.

## Verify
`npm run dev` → curl `/robots.txt` and `/sitemap.xml` (all routes present, absolute URLs). View-source on `/compare`: unique `<title>`, description, canonical, `og:image`. `npm test && npm run build && npm run lint`.

## Out of scope
Corridor pages (T13), provider metadata beyond sitemap entries (T14), landing project (T15), i18n/hreflang on the app.
