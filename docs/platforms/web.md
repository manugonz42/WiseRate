# Platform: Web

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md), [navigation](../architecture/navigation.md), [localization](../architecture/localization.md), all [services](../services/)
- **Future:** ⏳ PWA wrapper, ⏳ account auth (magic link + OAuth)

## Used by
- Web port lives under `web/` (after migration from `WiseRate-Web/index.html`)
- Each [module](../modules/) maps its web path here in its Platform notes

> **The web is a full-web responsive app, not a mobile clone.** iOS/Android are native mobile; the web targets desktop first and collapses to mobile. Don't constrain web layouts to a phone-width column.

## Current state

**Next.js port underway under `web/`.** Scaffolded (Next.js 15 App Router · TS · Tailwind), tokens copied to `styles/tokens.css`, mock service layer (`lib/services/`) + TS models (`lib/models/`) + shared primitives (`components/`) in place, 5-destination shell wired. **Home is ported** (`app/(tabs)/home/`); the other four render placeholders pending their per-screen PRs. The shell is being moved off the original phone-width, bottom-tab-bar layout to the responsive top-nav layout below.

`WiseRate-Web/index.html` — a 2,416-line single-file prototype, kept as the **frozen visual reference** until web parity reaches Home + Compare + Provider Detail. Screens in it: Home, Compare, Analytics, Premium, Profile, Referral, Settings, Provider Detail. **Onboarding is missing** — flagged in [navigation](../architecture/navigation.md).

## Target stack

**Next.js 15 (App Router) + TypeScript + Tailwind + i18next**.

Why:
- TypeScript lets us share generated types from [data-model](../architecture/data-model.md) with backend.
- App Router gives file-based routing that maps 1:1 to our routes.
- Tailwind binds our design tokens via `tailwind.config.ts`.
- i18next is the most ecosystem-aligned choice for en/es/tl.

## Folder layout (target)

```
web/
├── app/
│   ├── page.tsx        # public, indexable landing
│   ├── (tabs)/{home,compare,analytics,alerts,profile}/page.tsx
│   ├── provider/[id]/page.tsx
│   ├── onboarding/page.tsx
│   ├── sitemap.ts      # SEO — see seo.md
│   ├── robots.ts       # SEO — see seo.md
│   └── layout.tsx
├── components/
│   ├── nav/            # TopNav (desktop) + MobileTabBar (mobile)
│   └── ...             # shared UI primitives (Card, Button, Chip, ...)
├── features/<module>/  # feature-local components + hooks + state
├── lib/
│   ├── services/       # rate, alerts, persistence (IndexedDB)
│   ├── i18n/
│   └── models/         # generated TS types from data-model.md
├── public/
└── styles/
    └── tokens.css      # CSS vars from design-system.md
```

## Layout & responsive

- **Desktop (`≥ md`):** fixed **top nav** (`components/nav/TopNav.tsx`) + content centered at **`max-w-6xl`**. Multi-column grids — e.g. Top Providers as a 3–4-col grid, **not** a horizontal scroller.
- **Mobile (`< md`):** top nav collapses to a hamburger / bottom **`MobileTabBar`**; single-column layouts. Both nav components map to the same `app/(tabs)/` routes (see [navigation](../architecture/navigation.md)).
- **Breakpoints/container:** per [design-system](../architecture/design-system.md#breakpoints-web).
- **Performance:** Server Components by default, `"use client"` only where there's state; `next/font` with `display: swap`; `next/image` for logos/OG; reserve hero/skeleton heights to avoid CLS. Target green Core Web Vitals (LCP/INP/CLS) — tracked in [seo.md](../architecture/seo.md).

## Migration plan (from `index.html`)

1. ✅ Scaffold Next.js project under `web/`.
2. ✅ Copy `:root` CSS vars verbatim into `styles/tokens.css` (matches [design-system](../architecture/design-system.md)); bound to Tailwind in `tailwind.config.ts`.
3. Move the shell off the phone-width / bottom-tab-bar layout to the responsive top-nav layout (above): `max-w-6xl` container + `TopNav`/`MobileTabBar`.
4. **Redesign** each screen to a responsive full-web layout (not a 1:1 mobile port), one at a time, in [MODULES.md](../MODULES.md) order. Each = one PR. ✅ Home · next: Comparison → Provider Details → …
5. Keep `WiseRate-Web/index.html` until web parity reaches Home + Compare + Provider Detail (the affiliate-link earning flow).
6. **Final:** public landing (`/`) + SEO (web) / ASO (apps) — see [seo.md](../architecture/seo.md).

## State management

React state + Zustand for cross-screen state (current quote query, comparison result). No Redux.

## Persistence

IndexedDB via Dexie — see [persistence](../services/persistence.md).

## Build / dev

`cd web && npm install && npm run dev` for local; deploy target Vercel. PWA wrapper deferred.

Pin Next to a patched 15.5.x (`npm audit` clears the critical dev-server advisories). One moderate remains — a `postcss` XSS in the copy **bundled inside `next`'s own `node_modules`** (Next build tooling, not our top-level `postcss`); no non-breaking fix and no app-input attack surface, so it's accepted until a Next patch ships.

## Auth (later)

Same backend as iOS/Android — magic link + Apple/Google OAuth. Out of scope for the initial port.
