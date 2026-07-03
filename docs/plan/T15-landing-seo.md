# T15 — Landing SEO (root domain)

## Dependencies
- **Reads:** [landing](../modules/landing.md), [localization](../architecture/localization.md), `landing/app/[locale]/layout.tsx`, `landing/lib/i18n/*`
- **Task deps:** T13 (corridor URL to cross-link) — T12/T14 not required

## Used by
- Root-domain rankings (`sulitsend.app`); funnels authority to `app.sulitsend.app` pages

## Goal
Complete the landing project's SEO surface: metadataBase + canonical + hreflang across en/es/tl, robots, sitemap, OG image, Organization/WebSite JSON-LD, and a cross-link to the corridor page.

## Pre-made decisions
- **Root URL:** `NEXT_PUBLIC_SITE_URL ?? "https://sulitsend.app"` in a small `landing/lib/site.ts` (mirror of web's — landing has its own design system *and* its own utils; don't import across projects).
- **Hreflang:** in `generateMetadata`, `alternates: { canonical: "/${locale}", languages: { en: "/en", es: "/es", tl: "/tl", "x-default": "/en" } }`. First check how `/` resolves (redirect vs rewrite to default locale) and note it in the final report — do not change routing behavior in this task.
- **robots.ts / sitemap.ts:** standard; sitemap = the 3 locale roots.
- **OG image:** `app/opengraph-image.tsx` with landing's display font vibe but no external assets; same wordmark+tagline approach as web T12.
- **JSON-LD** on the locale page: `Organization` (name SulitSend, url root, logo = OG image URL) + `WebSite`. No SearchAction (no site search).
- **Cross-link:** add a footer link "Compare EUR→PHP rates" → `https://app.sulitsend.app/send/eur-to-php` (hardcoded absolute URL is fine here — different deployment). New dictionary key in **all three** locale files; `tl` may be machine-translated (documented landing exception in [localization](../architecture/localization.md)).
- Brand copy check while in there: any residual "WiseRate" in landing strings → flag in report, don't mass-rename.

## Steps
1. `landing/lib/site.ts` + metadata/hreflang in the locale layout.
2. robots.ts, sitemap.ts, opengraph-image.tsx.
3. JSON-LD component on the locale page.
4. Footer cross-link + dictionary keys ×3.
5. Update [landing](../modules/landing.md) spec (one line: SEO surface shipped) and check off T15 in plan README.

## Verify
`cd landing && npm run dev` → curl `/robots.txt`, `/sitemap.xml`; view-source `/en` and `/es`: hreflang cluster complete and symmetric, canonical per locale, JSON-LD parses. `npm run build` (+ lint if configured) green.

## Out of scope
New landing sections/copy, app-side hreflang (app is en-only), analytics on landing.
