# Platform: Web

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md), [navigation](../architecture/navigation.md), [localization](../architecture/localization.md), all [services](../services/)
- **Future:** ⏳ PWA wrapper, ⏳ account auth (magic link + OAuth), ⏳ i18next wiring

## Used by
- Production app under `web/`; each [module](../modules/) maps its web path in its Platform notes
- `WiseRate-Web/index.html` is the frozen single-file prototype — visual reference only, never add features there

## Stack

**Next.js 15 (App Router) + TypeScript + Tailwind** (tokens bound in `tailwind.config.ts` / `styles/tokens.css`). Charts: **Recharts** (decided T05, all web charts). State: React state (+ Zustand if cross-screen state appears; no Redux). Persistence: localStorage via `lib/services/persistence.ts` today; IndexedDB/Dexie when data outgrows it ([persistence](../services/persistence.md)). i18n: i18next, not wired yet. `npm run dev` (repo uses npm); deploy target Vercel. SEO: `NEXT_PUBLIC_SITE_URL` (`lib/site.ts`) backs metadataBase/sitemap/robots/canonical — unset defaults to `https://app.sulitsend.app`.

## Desktop layout (web is not a phone screen)

- **Top nav bar**, not bottom tabs: sticky header, SulitSend wordmark + all 5 [tabs](../architecture/navigation.md#tab-bar-5-tabs) inline. Icons `@phosphor-icons/react`; labels show at `sm`+, icon-only below (`aria-label` carries the name). Unported tabs render disabled/muted, never 404 — un-disable as modules land per [MODULES.md](../MODULES.md).
- **Breakpoints**: standard Tailwind; `md` (768) is the phone→desktop hinge — tables/multi-column at `md`+, stacked cards below.
- **Content width**: data screens use `max-w-4xl` centered — real-table wide, still readable; never phone-width `max-w-lg`.
- **Compare table** at `md`+: Provider · Recipient gets · Fee · Markup · Speed · Trust (· Send); cards below `md`.
- **Best-deal emphasis**: `--warning` amber (matches mobile), shown twice on purpose — banner + highlighted row — so it survives scrolling. Trust = 5 dots (`trustScore * 5`, rounded).
- **No landing-page patterns** (heroes, marquees, `py-24`+ whitespace): this is a utility surface. The marketing page is the separate `landing/` project ([landing](../modules/landing.md)) at the root domain; this app serves `app.sulitsend.app`.

## Layout

```
web/
├── app/(tabs)/{home,compare,analytics,alerts}/page.tsx   # profile pending
├── app/provider/[id]/ · app/{privacy,cookies}/ · app/api/{quotes,history,health}/
├── app/{about,how-we-make-money,terms}/   # trust pages — T17
├── components/          # ConsentBanner, AnalyticsProvider, shared primitives
├── lib/
│   ├── services/        # quotes aggregator, providers/*, cache, history, persistence, trust
│   ├── models/types.ts  # mirrors data-model.md
│   ├── data/providers.ts  # editorial profiles (affiliate URLs land here)
│   └── {analytics,consent,brokers}.ts
└── styles/tokens.css    # CSS vars from design-system.md
```

## Verification

`npm test` (vitest) + `npm run build` + `npm run lint` must pass on every change. For interactive flows use the Playwright recipe in [plan/README](../plan/README.md#runtime-ui-verification-reusable-recipe).

## Auth (later)

Same backend as iOS/Android — magic link + Apple/Google OAuth. Out of scope for now.
