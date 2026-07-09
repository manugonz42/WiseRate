# Localization

## Dependencies
- **Reads:** — (root spec)
- **Future:** ⏳ canonical single-source strings file (one source generating `Localizable.xcstrings` / `strings.xml` / web JSON — today each platform is hand-maintained and web has no i18n wired yet), ⏳ `tl` translations after content freeze per module, ⏳ id/fr/pt-BR/ar locales

## Used by
- Every [module](../modules/) (string keys consumed in views)
- [settings](../modules/settings.md) (language switcher)
- [referral](../modules/referral.md), [premium](../modules/premium.md) (localized share + pricing copy)
- [analytics](../services/analytics.md) (consent text in GDPR markets)

## Supported locales

| Code | Language | Priority |
|---|---|---|
| `en` | English | default, fallback |
| `es` | Spanish | high — author / dev audience |
| `tl` | Tagalog | high — primary user audience (EUR→PHP corridor) |

Additional locales (id, fr, pt-BR, ar) will be added once content stabilizes.

## Key naming

Format: `<feature>.<subkey>` lower camelCase.

```
home.heroSubtitle
home.topProvidersTitle
comparison.sortByRate
alerts.create.placeholder
onboarding.welcome.title
```

Avoid leaking implementation details (`home.tableRow1`) — keys describe meaning.

## Per-platform storage

| Platform | Mechanism |
|---|---|
| iOS | String Catalog (`Localizable.xcstrings`) |
| Android | `res/values{-es,-tl}/strings.xml` |
| Web | `i18next` with JSON files under `locales/<code>/<namespace>.json` — client-side, scoped to `(tabs)/` screens only |

### Web mechanism (i18next)

**Init:** `web/lib/i18n.ts` initializes i18next with three JSON resources (en/es/tl), with locale resolution: `localStorage["sulitsend.locale.v1"]` → `navigator.language` prefix (`es*`→es, `tl`/`fil*`→tl) → `en`.

**Provider:** `web/components/I18nProvider.tsx` wraps `(tabs)/layout.tsx`. Pages outside `(tabs)/` remain English.

**Localized surfaces (exhaustive):**
- `(tabs)/layout.tsx` — tab labels (Home, Compare, Analytics, Alerts, Promos), footer links, live pill label
- `(tabs)/home/page.tsx`
- `(tabs)/compare/page.tsx`
- `(tabs)/analytics/page.tsx`
- `(tabs)/alerts/page.tsx`
- `(tabs)/promos/page.tsx`
- `ConsentBanner.tsx`

**Not localized (stays English):**
- Legal pages (`/about`, `/how-we-make-money`, `/terms`, `/privacy`, `/cookies`)
- Corridor SEO pages (`/corridors/*`)
- Provider editorial profiles (`providers.ts` copy)
- Metadata / OG tags
- Landing site (separate i18n system)
- `/send/*` and `/provider/*` routes

**Language selector:** `web/components/LanguageSelect.tsx` — Globe icon + native `<select>` (options: EN / ES / TL), styled as small pills. Three placements:
1. Mobile/sm header: right side next to live pill
2. Desktop sidebar (narrow): bottom under nav
3. Home desktop: top-right nav row

Changes persist in `localStorage["sulitsend.locale.v1"]` and re-render via react-i18next.

## Pluralization & interpolation

Use ICU MessageFormat where the platform supports it. iOS String Catalog and i18next both do. Android falls back to `getQuantityString`.

Example key + values:
```
alerts.count.label
  en: "{count, plural, one {# alert} other {# alerts}}"
  es: "{count, plural, one {# alerta} other {# alertas}}"
  tl: "{count, plural, one {# alerto} other {# mga alerto}}"
```

## Number, currency, date

Never hardcode. Use the platform formatter with the user's preferred locale (fallback: device locale → `en`).

- Currency: always show the ISO code next to the symbol on ambiguous cases (₱ PHP, €).
- Dates: relative for <7 days ("2h ago"), absolute (`d MMM yyyy`) otherwise.

## Sourcing translations

`tl` will be done by a native speaker after content freeze per module. Until then, keep `tl` aligned with `en` (no machine-translated strings in source — flag with comments instead).

For web ([T29](../plan/T29-web-i18n.md) onward): `web/locales/tl/common.json` is a byte-identical copy of `en` plus a `"_note"` key flagging the mirror status. No machine translation in source.

**Exception:** [landing](../modules/landing.md) ships a machine-translated `tl` draft on purpose, so its language switcher has real text instead of `en` copy under a `tl` label. Generated via `landing/scripts/translate-tl.mjs` (Google Translate, reusable for other modules once they need a same-day `tl` draft), flagged with a header comment in the generated file and still pending native-speaker review before being final. Default to the mirror-`en` approach for new modules unless there's a similar reason to need draft copy immediately.
