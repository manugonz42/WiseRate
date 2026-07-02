# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Start here

**`docs/` is the source of truth.** Read only the spec you need — don't re-explore the repo to re-derive status:

- [`docs/MODULES.md`](docs/MODULES.md) — **single status source**: every module × platform + service state (what's real vs mock)
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — launch phases, priorities, budget
- [`docs/modules/<name>.md`](docs/modules/) — one spec per feature, with Dependencies / Used by / Acceptance criteria
- [`docs/architecture/`](docs/architecture/) — data model, navigation, design tokens, localization
- [`docs/services/`](docs/services/) — contracts: exchange-rate, persistence, notifications, subscriptions, analytics
- [`docs/platforms/{ios,web,android}.md`](docs/platforms/) — per-platform conventions

When a spec and the code disagree, **update the spec first, then change the code.**

## Working preferences

- Maximum brevity. No preamble, no end-of-turn summary, no narrating what you're about to do.
- The user knows git, shell, and common dev workflows. Don't explain them.
- Batch independent writes/edits in parallel. Don't pause for per-file confirmation inside an approved task.
- Default to "light" specs in `docs/` — ~1 page per file. Split rather than bloat.
- Every new spec under `docs/` (except `README.md` and `MODULES.md`) carries `## Dependencies` + `## Used by` directly after the title. Mark planned-but-unwired deps with ⏳.

## Repo layout

```
WiseRate/       iOS SwiftUI app — Frankfurter networking, SwiftData, StoreKit 2, local notifications
web/            Next.js 15 production web app — Compare wired to real provider quotes via /api/quotes
landing/        Marketing site (standalone Next.js, own design system; root domain — app is app.wiserate.app)
android/        Jetpack Compose scaffold — all screens present, mock data
WiseRate-Web/   Frozen single-file prototype (visual reference only — never add features here)
docs/           Cross-platform spec (the brain)
```

## Architecture

Three platforms, one shared spec, four layers each: **View** (SwiftUI / Compose / React) → **ViewModel** (observable state + intents, no I/O) → **Service** (protocol-defined I/O, mock ↔ real swappable) → **Model** (mirrors [`docs/architecture/data-model.md`](docs/architecture/data-model.md)).

## Build & run

- **Web**: `cd web && npm install && npm run dev` → localhost:3000. Deploy target: Vercel.
- **Landing**: `cd landing && npm install && npm run dev`
- **iOS**: no `.xcodeproj` checked in — create an Xcode iOS App project referencing `WiseRate/` (iOS 17+, iPhone 15 Pro sim). Onboarding auto-completes in `WiseRate/App/WiseRateApp.swift`; remove that line when shipping real onboarding.
- **Android**: `cd android && ./gradlew assembleDebug`
- **Prototype**: open `WiseRate-Web/index.html` directly (no build).

## Tests

None wired yet. Conventions sketched in [`docs/platforms/ios.md`](docs/platforms/ios.md).

## Design tokens & locales

Dark theme only. Canonical tokens: [`docs/architecture/design-system.md`](docs/architecture/design-system.md). Changing a token = update the spec **and** every platform copy. Locales: `en` (default), `es`, `tl` — see [`docs/architecture/localization.md`](docs/architecture/localization.md); never commit machine-translated `tl` (the landing page carries a documented, deliberate exception).

## Sequencing for new work

Follow [`docs/ROADMAP.md`](docs/ROADMAP.md) — web revenue path first, then iOS, backend, Android.
