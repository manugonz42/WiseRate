# Module: Landing

**Status:** ✅ shipped (Web only)

## Dependencies
- **Reads (architecture):** [localization](../architecture/localization.md)
- **Deliberately does not read:** [design-system](../architecture/design-system.md) — the landing page uses its own standalone palette/type, not the app's tokens (see Platform notes)
- **Navigates to:** the real app at `APP_URL` (`web/`, deployed at `app.sulitsend.com`)
- **Future:** ⏳ analytics wiring, ⏳ native `tl` copy review

## Used by
- Root domain (`sulitsend.com`) — first-touch marketing page for prospective users, before they reach the working comparison tool

## Purpose
Convert visitors into users of the real comparison tool. Not a utility screen — a marketing surface, so it intentionally breaks from `docs/platforms/web.md`'s "no landing-page patterns" rule, which applies to the `web/` app, not this project.

## Requirements locked in from user feedback (do not regress)

1. **Real, locale-correct imagery.** Placeholder photography (e.g. `picsum.photos` seeded URLs) does not actually depict its seed subject, it returns an arbitrary stock photo. Any hero/section image claiming to show the Philippines must be an actual photo of the Philippines, sourced from a real, appropriately licensed origin (currently: Wikimedia Commons, CC BY-SA, credited inline near the image). Swap placeholders for real, correctly attributed photography before shipping, never after.
2. **Multi-locale from day one, with a working switcher.** The page ships in `en` / `es` / `tl` per [localization](../architecture/localization.md), routed via `app/[locale]/`, with a visible switcher (nav + footer), not just the language the request happened to be written in. `tl` is a machine-translation draft (Google Translate, via `landing/scripts/translate-tl.mjs`, see Platform notes) rather than left mirroring `en` — an explicit, deliberate exception to the "no machine-translated strings" default in [localization](../architecture/localization.md#sourcing-translations), made so the switcher has real Tagalog text to show now. It is flagged in a header comment in `landing/lib/i18n/dictionaries/tl.ts` and still needs a native-speaker pass before it's treated as final copy.

## Platform notes
- **Web**: standalone Next.js 15 project at `landing/` (own `package.json`, not part of `web/`'s workspace). Tailwind v4, own token set in `landing/app/globals.css` (terracotta/slate, distinct from the app's violet/cyan), Outfit + Plus Jakarta Sans fonts, Motion for entrance/scroll animation.
- i18n: `landing/lib/i18n/` (config, dictionary type, per-locale dictionaries, `get-dictionary`), `landing/middleware.ts` (Accept-Language + `NEXT_LOCALE` cookie detection, redirects `/` → `/{locale}`).
- Translation tooling: `landing/scripts/translate-tl.mjs` (`npm run translate:tl`) regenerates `tl.ts` from `en.ts` by walking every dictionary leaf through `landing/scripts/google-translate.mjs`. That helper shells out to `curl` instead of using `fetch`, because Node's fetch/undici fails against `translate.google*` in this dev environment (TLS renegotiation), and builds the request URL in JS so non-ASCII text (`€`, `©`) survives — passing it as a raw `curl` argument gets mangled by Windows' argv encoding. Re-run after any `en.ts` copy change, then re-review the diff.
- CTA target: `landing/lib/config.ts` (`APP_URL`, defaults to `https://app.sulitsend.com/compare`; `CORRIDOR_URL` for the footer cross-link, defaults to `https://app.sulitsend.com/send/eur-to-php`).
- SEO surface shipped (T15): `lib/site.ts` (`SITE_URL`), per-locale canonical + symmetric hreflang cluster (en/es/tl + x-default) in `[locale]/layout.tsx`, `robots.ts`/`sitemap.ts`/`opengraph-image.tsx` at the app root (excluded from the locale-redirect middleware matcher — see `middleware.ts`), Organization + WebSite JSON-LD on the locale page.

## Open questions
- Real product photography (family/remittance context) to replace the current Wikimedia landscape placeholders, once available.
- Where `tl` native-speaker review happens and who owns it.
