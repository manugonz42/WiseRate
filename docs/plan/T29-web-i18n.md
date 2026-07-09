# T29 — Web i18n foundation + subtle language selector (en/es, tl mirrors en)

## Dependencies
- **Reads:** [localization](../architecture/localization.md) (key naming, tl rule), `web/app/(tabs)/` screens, `web/components/ConsentBanner.tsx`
- **Task deps:** T23–T28 (extract strings once those screens are final)

## Used by
- `A_mejorar.md` item 2; T30 (settings language section), T31 (onboarding strings)

## Goal
Wire client-side i18n for the tab screens and let the user switch language via a subtle but visible selector. Locales: `en` (default), `es` (real translations), `tl` (**mirrors `en` — machine-translating `tl` is forbidden**, localization.md).

## Pre-made decisions (binding)
- **Dependencies (the only new ones allowed):** `i18next`, `react-i18next`. No detector plugin, no URL locale prefixes, no middleware.
- **Files:** `web/locales/en/common.json`, `web/locales/es/common.json`, `web/locales/tl/common.json`. `tl` is a byte-identical copy of `en` plus a first key `"_note": "tl mirrors en until native translation — docs/architecture/localization.md"`.
- **Init:** `web/lib/i18n.ts` — i18next init with the three JSON resources, `fallbackLng: "en"`. Locale resolution: `localStorage["sulitsend.locale.v1"]` → else `navigator.language` prefix (`es*`→es, `tl`/`fil*`→tl) → else `en`. Export `setLocale(code)` that calls `i18n.changeLanguage` + writes the key. SSR-safe (guard `typeof window`).
- **Provider:** a small client component `web/components/I18nProvider.tsx` wrapping `children` in `(tabs)/layout.tsx` (the layout is already a client component). Pages outside `(tabs)` are NOT wrapped.
- **Scope of extraction (exhaustive list — nothing else):** `(tabs)/layout.tsx` (tab labels, footer links, live pill), `home/page.tsx`, `compare/page.tsx`, `analytics/page.tsx`, `alerts/page.tsx`, `promos/page.tsx`, `components/ConsentBanner.tsx`. Keys per localization.md: `<feature>.<subkey>` lowerCamel (e.g. `compare.sortBestRate`, `home.familyGets`, `nav.promos`).
- **Explicitly NOT localized (stays English, note it in localization.md):** legal pages, /about, /how-we-make-money, corridor SEO pages, provider editorial profiles (`providers.ts` copy), metadata/OG, landing (has its own system). Number/currency formatting stays as-is (`Intl` en-US) — out of scope.
- **Selector ("subtle but visible"):** a compact control = `Globe` phosphor icon + native `<select>` with `EN / ES / TL` options, styled like the existing small pills. Three placements (all render the same `LanguageSelect` component, put it in `web/components/LanguageSelect.tsx`):
  1. mobile/sm header: right side, next to the live pill;
  2. desktop narrow sidebar: bottom, under the nav;
  3. Home desktop: in the top-right nav row.
  Changing it applies instantly (react-i18next re-render) and persists.
- **`es` copy:** written by the executor in natural Spanish (the project owner is a native speaker and reviews). Tone: same as en — short, direct, "tu" form. Brand stays "SulitSend"; currency/provider names untranslated.
- Work screen-by-screen; after each screen run `npm run build` to catch missed keys early.

## Steps
1. Update `docs/architecture/localization.md` first: web mechanism = i18next wired for tab screens (client-only), list the not-localized surfaces above.
2. Add deps, `lib/i18n.ts`, provider, empty `en/es/tl` JSONs, `LanguageSelect` + its three placements.
3. Extract strings: layout → home → compare → analytics → alerts → promos → ConsentBanner. Fill `en` + `es`; regenerate `tl` as the en mirror at the end.
4. Quick es review pass: read `es/common.json` top to bottom once for consistency (same terms for provider/fee/rate everywhere: proveedor/comisión/tipo de cambio).

## Verify
- Playwright: default is en; pick ES in the header → Compare heading and sort chips render in Spanish without reload; reload → still Spanish; switch TL → English text (mirror) but selector shows TL; localStorage key set.
- Grep check: no hardcoded user-visible English left in the seven scoped files (attribute values like `aria-label` count as user-visible; class names/analytics event names do not).
- `npm test && npm run build && npm run lint` green.

## Out of scope — do NOT
- No URL-based locales, no server components conversion, no translation of SEO/legal/editorial surfaces, no `tl` translation, no touching iOS/Android string files, no i18n of `/send/*` or `/provider/*`.
