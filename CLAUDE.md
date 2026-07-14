# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Start here

**`docs/` is the source of truth.** Read only the spec you need — don't re-explore the repo to re-derive status:

- [`docs/MODULES.md`](docs/MODULES.md) — **single status source**: every module × platform + service state (what's real vs mock)
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — launch phases, priorities, budget
- [`docs/plan/`](docs/plan/README.md) — Phase 1 execution record + open human-only checklist + Playwright verification recipe
- [`docs/modules/<name>.md`](docs/modules/) — one spec per feature (Dependencies / Used by / Acceptance criteria)
- [`docs/architecture/`](docs/architecture/) — data model, navigation, design tokens, localization
- [`docs/services/`](docs/services/) — contracts: exchange-rate, persistence, notifications, subscriptions, analytics
- [`docs/platforms/{ios,web,android}.md`](docs/platforms/) — per-platform conventions

When a spec and the code disagree, **update the spec first, then change the code.**

## Working preferences

- Maximum brevity. No preamble, no end-of-turn summary, no narrating what you're about to do.
- The user knows git, shell, and common dev workflows. Don't explain them.
- Batch independent writes/edits in parallel. Don't pause for per-file confirmation inside an approved task.
- Specs in `docs/` stay light (~1 page; split rather than bloat) and carry `## Dependencies` + `## Used by` right after the title (except `README.md`/`MODULES.md`). Mark planned-but-unwired deps with ⏳.

## Repo layout

Product name: **SulitSend** (working name since 2026-07). Directories and internal identifiers (`WiseRate/`, `com.wiserate`, `wiserate://`, SKUs) keep the legacy naming until the definitive rebrand — see the ROADMAP Phase 1 rename item before touching any of them.

```
WiseRate/       iOS SwiftUI app — Frankfurter rate, SwiftData, StoreKit 2, local notifications; quotes mock
web/            Next.js 15 production app — 5 screens live on real quotes (/api/quotes|history|health)
landing/        Marketing site (standalone Next.js, own design system; root domain — app is app.sulitsend.com)
android/        Jetpack Compose scaffold — all screens, mock data, FROZEN until Phase 4
WiseRate-Web/   Frozen single-file prototype (visual reference only — never add features here)
docs/           Cross-platform spec (the brain)
```

## Architecture

Three platforms, one shared spec, four layers each: **View** (SwiftUI / Compose / React) → **ViewModel** (observable state + intents, no I/O) → **Service** (protocol-defined I/O, mock ↔ real swappable) → **Model** (mirrors [`docs/architecture/data-model.md`](docs/architecture/data-model.md)).

## Build, test, run

- **Web**: `cd web && npm install && npm run dev` → localhost:3000 (3000 often taken — check the port). Every change: `npm test && npm run build && npm run lint` green. Vitest covers provider parsers (committed fixtures), history, cache. Interactive flows: Playwright recipe in [`docs/plan/README.md`](docs/plan/README.md).
- **Landing**: `cd landing && npm run dev`
- **iOS**: no `.xcodeproj` — create an Xcode iOS App project referencing `WiseRate/` (iOS 17+, iPhone 15 Pro sim). Onboarding auto-completes in `WiseRateApp.swift`; remove when shipping real onboarding. Test conventions: [`docs/platforms/ios.md`](docs/platforms/ios.md).
- **Android**: `cd android && ./gradlew assembleDebug`

## Design tokens & locales

Pistacho light theme (web is the canonical implementation; iOS/Android still carry the legacy dark theme until their re-skin). Canonical tokens: [`docs/architecture/design-system.md`](docs/architecture/design-system.md). Changing a token = update the spec **and** every platform copy. Locales: `en` (default), `es`, `tl` — see [`docs/architecture/localization.md`](docs/architecture/localization.md); never commit machine-translated `tl` (the landing page carries a documented, deliberate exception).

## Sequencing for new work

Follow [`docs/ROADMAP.md`](docs/ROADMAP.md) — web revenue path first, then iOS, backend, Android. Brand name in UI copy is always SulitSend, never WiseRate.
