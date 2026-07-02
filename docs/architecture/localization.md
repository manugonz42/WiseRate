# Localization

## Dependencies
- **Reads:** — (root spec)
- **Future:** ⏳ `tl` translations after content freeze per module, ⏳ id/fr/pt-BR/ar locales

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
| Web | `i18next` with JSON files under `locales/<code>/<namespace>.json` |

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

**Exception:** [landing](../modules/landing.md) ships a machine-translated `tl` draft on purpose, so its language switcher has real text instead of `en` copy under a `tl` label. Generated via `landing/scripts/translate-tl.mjs` (Google Translate, reusable for other modules once they need a same-day `tl` draft), flagged with a header comment in the generated file and still pending native-speaker review before being final. Default to the mirror-`en` approach for new modules unless there's a similar reason to need draft copy immediately.
