# Module: Landing

**Status:** in-progress (Web only)

## Dependencies
- **Reads (architecture):** [localization](../architecture/localization.md)
- **Deliberately does not read:** [design-system](../architecture/design-system.md) — the landing page uses its own standalone palette/type, not the app's tokens (see Platform notes)
- **Navigates to:** the real app at `APP_URL` (`web/`, deployed at `app.wiserate.app`)
- **Future:** ⏳ analytics wiring, ⏳ native `tl` copy review

## Used by
- Root domain (`wiserate.app`) — first-touch marketing page for prospective users, before they reach the working comparison tool

## Purpose
Convert visitors into users of the real comparison tool. Not a utility screen — a marketing surface, so it intentionally breaks from `docs/platforms/web.md`'s "no landing-page patterns" rule, which applies to the `web/` app, not this project.

## Requirements locked in from user feedback (do not regress)

1. **Real, locale-correct imagery.** Placeholder photography (e.g. `picsum.photos` seeded URLs) does not actually depict its seed subject, it returns an arbitrary stock photo. Any hero/section image claiming to show the Philippines must be an actual photo of the Philippines, sourced from a real, appropriately licensed origin (currently: Wikimedia Commons, CC BY-SA, credited inline near the image). Swap placeholders for real, correctly attributed photography before shipping, never after.
2. **Multi-locale from day one, with a working switcher.** The page ships in `en` / `es` / `tl` per [localization](../architecture/localization.md), routed via `app/[locale]/`, with a visible switcher (nav + footer), not just the language the request happened to be written in. `tl` must mirror `en` word-for-word (never machine-translated) until a native speaker reviews it, per localization policy — see `landing/lib/i18n/dictionaries/tl.ts`.

## Platform notes
- **Web**: standalone Next.js 15 project at `landing/` (own `package.json`, not part of `web/`'s workspace). Tailwind v4, own token set in `landing/app/globals.css` (terracotta/slate, distinct from the app's violet/cyan), Outfit + Plus Jakarta Sans fonts, Motion for entrance/scroll animation.
- i18n: `landing/lib/i18n/` (config, dictionary type, per-locale dictionaries, `get-dictionary`), `landing/middleware.ts` (Accept-Language + `NEXT_LOCALE` cookie detection, redirects `/` → `/{locale}`).
- CTA target: `landing/lib/config.ts` (`APP_URL`, defaults to `https://app.wiserate.app/compare`).

## Open questions
- Real product photography (family/remittance context) to replace the current Wikimedia landscape placeholders, once available.
- Where `tl` native-speaker review happens and who owns it.
