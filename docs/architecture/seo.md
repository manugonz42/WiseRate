# SEO / ASO

Discoverability for the web (search engines) and the apps (app stores). The web is a public, indexable full-web app — see [web platform](../platforms/web.md).

## Dependencies
- **Reads:** [web platform](../platforms/web.md), [navigation](navigation.md) (routes, deep links), [localization](localization.md) (en/es/tl), [data-model](data-model.md) (provider/rate entities for structured data)
- **Future:** ⏳ universal links / app links (needs provisioned domain — see [navigation](navigation.md)), ⏳ analytics goals for organic traffic

## Used by
- [web platform](../platforms/web.md) — landing + per-route metadata implementation
- [iOS](../platforms/ios.md) / [Android](../platforms/android.md) — ASO checklists

## Web SEO

Lands as the **final** step of the web redesign (after screen parity).

- **Public landing** (`app/page.tsx`) — indexable, server-rendered, explains the EUR→PHP corridor + top providers; primary entry for organic traffic.
- **Per-route metadata** — `generateMetadata` per page (title, description, canonical). Avoid duplicate titles across `(tabs)` routes.
- **`app/sitemap.ts`** + **`app/robots.ts`** — Next.js metadata routes; sitemap lists landing + public routes (exclude auth-gated/app-internal).
- **Structured data (JSON-LD)** — `Organization`, `Product`/`Service` (the comparison), `FAQPage` on landing. Inject via `<script type="application/ld+json">` in server components.
- **Open Graph + Twitter cards** — OG image via `next/og` (dynamic per route where useful); set `og:title/description/image/url`.
- **i18n hreflang** — `alternates.languages` for en/es/tl; one canonical per locale.
- **Core Web Vitals** — green LCP/INP/CLS is an acceptance criterion (reserve hero/skeleton heights, `next/font` `display: swap`, `next/image`, minimize client JS).

### Acceptance criteria (web)
- `/sitemap.xml` and `/robots.txt` served; landing + public routes present, app-internal excluded.
- Every public route has a unique title/description + canonical; hreflang covers en/es/tl.
- JSON-LD validates (Rich Results Test); OG image renders in link previews.
- Lighthouse SEO ≥ 95 and Core Web Vitals green on landing + Home.

## App Store Optimization (iOS / Android)

- **Listing per locale (en/es/tl)** — title, subtitle, keyword field (iOS) / short+full description (Android), localized screenshots highlighting the EUR→PHP comparison.
- **Deep links** — `wiserate://` scheme (see [navigation](navigation.md#deep-links)); promote universal links / app links once the domain is provisioned so web URLs open the app.
- **Web↔app parity** — landing CTAs and OG link to store listings; store listings link back to the canonical domain.

### Acceptance criteria (apps)
- Each store listing localized for en/es/tl with corridor-specific screenshots.
- Deep links resolve to the right screen on both platforms; universal/app links tracked as ⏳ pending domain.
