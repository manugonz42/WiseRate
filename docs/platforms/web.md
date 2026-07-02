# Platform: Web

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md), [navigation](../architecture/navigation.md), [localization](../architecture/localization.md), all [services](../services/)
- **Future:** ⏳ PWA wrapper, ⏳ account auth (magic link + OAuth)

## Used by
- Web port lives under `web/` (after migration from `WiseRate-Web/index.html`)
- Each [module](../modules/) maps its web path here in its Platform notes

## Current state

`WiseRate-Web/index.html` — a 2,416-line single-file prototype. Vanilla JS, no framework, no build step. Useful as a visual demo; not the production target.

Screens implemented inline: Home, Compare, Analytics, Premium, Profile, Referral, Settings, Provider Detail. **Onboarding is missing** — flagged in [navigation](../architecture/navigation.md).

### `web/` (production target) — scaffolded

Next.js 15 project now exists under `web/`. First feature wired: **Compare** (`app/(tabs)/compare/page.tsx`) against real quotes via `app/api/quotes/route.ts` (server proxy) → `lib/services/wise.ts` (Wise Comparisons API, no scraping). See [comparison](../modules/comparison.md) and [exchange-rate](../services/exchange-rate.md). Run: `cd web && npm install && npm run dev`.

## Target stack

**Next.js 15 (App Router) + TypeScript + Tailwind + i18next**.

Why:
- TypeScript lets us share generated types from [data-model](../architecture/data-model.md) with backend.
- App Router gives file-based routing that maps 1:1 to our routes.
- Tailwind binds our design tokens via `tailwind.config.ts`.
- i18next is the most ecosystem-aligned choice for en/es/tl.

## Desktop layout (web is not a phone screen)

The mobile prototype (`index.html`) and the early `web/` scaffold both used a phone-width column (`max-w-lg`, bottom-tab mental model) ported straight over. That's wrong for web — desktop gets real nav chrome and uses the width it has.

- **Top nav bar**, not a bottom tab bar: sticky header with the WiseRate wordmark + all 5 [tabs](../architecture/navigation.md#tab-bar-5-tabs) rendered inline (single line, no hamburger). Icons: `@phosphor-icons/react` (`House`, `ArrowsLeftRight`, `ChartLineUp`, `Bell`, `UserCircle`), replacing the emoji glyphs the mobile prototype used inline. Labels show at `sm` (640px) and up; below that the nav is icon-only (`aria-label` carries the name) so it doesn't overflow narrow viewports. Tabs whose page isn't ported yet render disabled/muted (no `<Link>`) instead of 404ing — remove the disabled state as each module lands per [MODULES.md](../MODULES.md).
- **Breakpoints**: standard Tailwind (`sm 640 · md 768 · lg 1024 · xl 1280`). `md` is the phone→desktop hinge — data views (tables, multi-column) activate at `md`, single-column card lists below it.
- **Content width**: data-dense screens (Compare) use `max-w-4xl` centered, not a phone-width `max-w-lg` — wide enough for a real table, still short enough to read comfortably (this is a utility app, not a full-bleed dashboard).
- **Compare table**: at `md+`, quotes render as a real `<table>` (Provider · Recipient gets · Fee · Speed · Trust) instead of a stacked card list. Below `md`, falls back to the existing card-row layout.
- **Best-deal emphasis**: matches the mobile prototype's semantic choice — `--warning` (amber `#FFB800`), not `--primary`. Shown twice on purpose (banner above the table/list **and** the matching row gets the amber left-border + tinted background) so it isn't lost on scroll. Trust score renders as 5 filled/empty dots (`trustScore * 5`, rounded) rather than a raw decimal.
- **No landing-page patterns**: no hero sections, marquees, scroll-hijacking, or macro-whitespace (`py-24`+). This is a utility/dashboard surface — see the rejected `design-taste-frontend` / `high-end-visual-design` / `minimalist-ui` skills, which target marketing pages, not this app. The marketing landing page lives in its own project instead: see [landing](../modules/landing.md) (`landing/`, standalone Next.js, own design system, deployed at the root domain while this app serves `app.wiserate.app`).

## Folder layout (target)

```
web/
├── app/
│   ├── (tabs)/{home,compare,analytics,alerts,profile}/page.tsx
│   ├── provider/[id]/page.tsx
│   ├── onboarding/page.tsx
│   └── layout.tsx
├── components/         # shared UI primitives (Card, Button, Chip, ...)
├── features/<module>/  # feature-local components + hooks + state
├── lib/
│   ├── services/       # rate, alerts, persistence (IndexedDB)
│   ├── i18n/
│   └── models/         # generated TS types from data-model.md
├── public/
└── styles/
    └── tokens.css      # CSS vars from design-system.md
```

## Migration plan (from `index.html`)

1. Scaffold Next.js project under `web/`.
2. Copy `:root` CSS vars verbatim into `styles/tokens.css` (already matches [design-system](../architecture/design-system.md)).
3. Port screens one at a time, in [MODULES.md](../MODULES.md) order. Each port = one PR.
4. Keep `WiseRate-Web/index.html` until web parity reaches Home + Compare + Provider Detail (the affiliate-link earning flow).

## State management

React state + Zustand for cross-screen state (current quote query, comparison result). No Redux.

## Persistence

IndexedDB via Dexie — see [persistence](../services/persistence.md).

## Build / dev

`pnpm dev` for local; deploy target Vercel. PWA wrapper deferred.

## Auth (later)

Same backend as iOS/Android — magic link + Apple/Google OAuth. Out of scope for the initial port.
