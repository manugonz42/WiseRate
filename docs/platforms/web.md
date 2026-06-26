# Platform: Web

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md), [navigation](../architecture/navigation.md), [localization](../architecture/localization.md), all [services](../services/)
- **Future:** ⏳ PWA wrapper, ⏳ account auth (magic link + OAuth)

## Used by
- Web port lives under `web/` (after migration from `SendRate-Web/index.html`)
- Each [module](../modules/) maps its web path here in its Platform notes

## Current state

Two trees coexist during migration:

- `SendRate-Web/index.html` — frozen 2,416-line single-file prototype. Vanilla JS, no framework, no build step. Visual reference, not the production target. Screens implemented inline: Home, Compare, Analytics, Premium, Profile, Referral, Settings, Provider Detail. **Onboarding is missing** — flagged in [navigation](../architecture/navigation.md).
- `web/` — **Next.js scaffold (steps 1–2 of the migration plan below done).** Design tokens bound, App Router routes stubbed for all 5 tabs + `provider/[id]` + `onboarding`, each rendering a spec-referenced `ModulePlaceholder`. `npm run build` passes. No screen ported off the prototype yet.

## Target stack

**Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + i18next**.

> Scaffolded version drift from the original plan: `create-next-app` shipped **Next 16 / React 19 / Tailwind v4** (plan said Next 15). Tailwind v4 has no `tailwind.config.ts` — tokens bind in CSS via `@theme` (see below). Next 16 route `params`/`searchParams` are Promises (await them).

Why:
- TypeScript lets us share generated types from [data-model](../architecture/data-model.md) with backend.
- App Router gives file-based routing that maps 1:1 to our routes.
- Tailwind binds our design tokens via `@theme` in `app/globals.css` (Tailwind v4; no JS config file).
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
2. ✅ Copy `:root` CSS vars verbatim into `styles/tokens.css` (matches [design-system](../architecture/design-system.md)); bound to Tailwind via `@theme` in `app/globals.css`.
3. ⏭️ Port screens one at a time, in [MODULES.md](../MODULES.md) order. Each port = one PR. (Routes currently render `ModulePlaceholder` stubs.)
4. Keep `SendRate-Web/index.html` until web parity reaches Home + Compare + Provider Detail (the affiliate-link earning flow).

## State management

React state + Zustand for cross-screen state (current quote query, comparison result). No Redux.

## Persistence

IndexedDB via Dexie — see [persistence](../services/persistence.md).

## Build / dev

`npm run dev` for local (`npm run build` to verify); deploy target Vercel. PWA wrapper deferred. (Scaffold uses npm — `package-lock.json` is committed; switch to pnpm later if desired.)

## Auth (later)

Same backend as iOS/Android — magic link + Apple/Google OAuth. Out of scope for the initial port.
