# Platform: Web

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md), [navigation](../architecture/navigation.md), [localization](../architecture/localization.md), all [services](../services/)
- **Future:** ⏳ PWA wrapper, ⏳ account auth (magic link + OAuth)

## Used by
- Web port lives under `web/` (after migration from `WiseRate-Web/index.html`)
- Each [module](../modules/) maps its web path here in its Platform notes

## Current state

**Next.js port underway under `web/`.** Scaffolded (Next.js 15 App Router · TS · Tailwind), tokens copied to `styles/tokens.css`, mock service layer (`lib/services/`) + TS models (`lib/models/`) + shared primitives (`components/`) in place, 5-tab shell wired. **Home is fully ported** (`app/(tabs)/home/`); the other four tabs render placeholders pending their per-screen PRs.

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

1. ✅ Scaffold Next.js project under `web/`.
2. ✅ Copy `:root` CSS vars verbatim into `styles/tokens.css` (matches [design-system](../architecture/design-system.md)); bound to Tailwind in `tailwind.config.ts`.
3. Port screens one at a time, in [MODULES.md](../MODULES.md) order. Each port = one PR. ✅ Home · next: Comparison → Provider Details → …
4. Keep `WiseRate-Web/index.html` until web parity reaches Home + Compare + Provider Detail (the affiliate-link earning flow).

## State management

React state + Zustand for cross-screen state (current quote query, comparison result). No Redux.

## Persistence

IndexedDB via Dexie — see [persistence](../services/persistence.md).

## Build / dev

`cd web && npm install && npm run dev` for local; deploy target Vercel. PWA wrapper deferred.

Pin Next to a patched 15.5.x (`npm audit` clears the critical dev-server advisories). One moderate remains — a `postcss` XSS in the copy **bundled inside `next`'s own `node_modules`** (Next build tooling, not our top-level `postcss`); no non-breaking fix and no app-input attack surface, so it's accepted until a Next patch ships.

## Auth (later)

Same backend as iOS/Android — magic link + Apple/Google OAuth. Out of scope for the initial port.
