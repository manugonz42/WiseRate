# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Start here

**`docs/` is the source of truth for what this product is and how each module behaves.** Before touching any feature code, read the relevant spec:

- [`docs/MODULES.md`](docs/MODULES.md) — index of every module × platform with status
- [`docs/modules/<name>.md`](docs/modules/) — one spec per feature (Home, Comparison, Alerts, …). Each has Dependencies / Used by / Acceptance criteria
- [`docs/architecture/`](docs/architecture/) — data model, navigation, design tokens, localization
- [`docs/services/`](docs/services/) — contracts for exchange-rate, persistence, notifications, subscriptions, analytics
- [`docs/platforms/{ios,web,android}.md`](docs/platforms/) — per-platform conventions

When a module spec and the code disagree, **update the spec first, then change the code.**

## Working preferences

- Maximum brevity. No preamble, no end-of-turn summary, no narrating what you're about to do.
- The user knows git, shell, and common dev workflows. Don't explain them.
- Batch independent writes/edits in parallel. Don't pause for per-file confirmation inside an approved task.
- Default to "light" specs in `docs/` — ~1 page per file. Split rather than bloat.
- Every new spec under `docs/` (except `README.md` and `MODULES.md`) carries `## Dependencies` + `## Used by` directly after the title. Mark planned-but-unwired deps with ⏳.

## Repo layout

```
SendRate/         iOS SwiftUI app (working scaffold, mock data)
SendRate-Web/     Single-file HTML/CSS/JS prototype (index.html, 2,416 lines)
docs/             Cross-platform spec scaffold (this is the brain)
```

Android target exists in specs only — no code yet.

## High-level architecture

Three platforms, one shared spec. Each platform implements the same four layers:

1. **View** (SwiftUI / Compose / React) — UI only
2. **ViewModel** — observable state + intents, no I/O
3. **Service** — protocol-defined I/O, swappable mock ↔ real
4. **Model** — plain data mirroring [`docs/architecture/data-model.md`](docs/architecture/data-model.md)

On iOS today, ViewModels all live in `SendRate/Core/ViewModels/ViewModels.swift` and services in `SendRate/Core/Services/Services.swift`. Both files are slated to split as features stabilize — see [`docs/platforms/ios.md`](docs/platforms/ios.md).

## Known stubs (most user-facing data is still mock)

Exchange rate (spot/historical) and iOS persistence are now real; the rest below is still stubbed.
`SendRate/Core/Services/Services.swift` defines protocols and mock implementations for:

- `ExchangeRateService` — **real**: fetches spot + historical EUR→PHP from Frankfurter (ECB daily, no key), with in-memory + disk caching and stale-while-revalidate. See [`docs/services/exchange-rate.md`](docs/services/exchange-rate.md)
- `TransferProviderService` — per-provider quotes are still mock (reads `SendRate/Data/Mock/MockData.swift`, 15 providers) but anchored to the real mid-market rate. Real quotes/aggregator deferred — see the "Deferred: comparison engine" note in the exchange-rate spec
- `NotificationService` — empty bodies. See [`docs/services/notifications.md`](docs/services/notifications.md)
- `SubscriptionService` — always returns `.free`. See [`docs/services/subscriptions.md`](docs/services/subscriptions.md)
- `AnalyticsService` — `print()` only. Event taxonomy in [`docs/services/analytics.md`](docs/services/analytics.md)

Persistence: **iOS is wired** — `PersistenceService` (SwiftData) in `SendRate/Core/Services/Persistence/` backs profile, alerts, favorites, recents, settings (cached-quote API reserved, not yet wired into Home/Comparison). Android (Room) / Web (IndexedDB) not started. See [`docs/services/persistence.md`](docs/services/persistence.md).

## Build & run

### iOS

No `.xcodeproj` is checked in yet — the Swift files exist as a structured source tree under `SendRate/`. To run today, create an Xcode iOS App project and add the `SendRate/` folder as a reference, then build for an iPhone 15 Pro simulator (iOS 17+).

Entry point: `SendRate/App/SendRateApp.swift`. Onboarding currently auto-completes inside that file — remove that line when shipping real onboarding (noted in [`docs/modules/onboarding.md`](docs/modules/onboarding.md)).

### Web (current prototype)

Static, no build step. Open `SendRate-Web/index.html` in a browser, or:

```sh
python3 -m http.server 8000 --directory SendRate-Web
```

Then visit `http://localhost:8000`. The production target is a Next.js port under `web/` — see [`docs/platforms/web.md`](docs/platforms/web.md). Don't add new features to `index.html`; treat it as a frozen reference.

### Android

Not started.

## Tests

None yet. Snapshot + unit test conventions are sketched in [`docs/platforms/ios.md`](docs/platforms/ios.md) but no tooling is wired.

## Design tokens

Dark theme only. Canonical tokens live in [`docs/architecture/design-system.md`](docs/architecture/design-system.md). The iOS values in `SendRate/Design/Theme/Colors.swift` and the web `:root` CSS vars in `SendRate-Web/index.html` already match — if you change a token in one place, update the spec **and** the other platform.

## Locales

`en` (default), `es`, `tl` (Tagalog — primary user audience: EUR→PHP corridor). See [`docs/architecture/localization.md`](docs/architecture/localization.md). Do not commit machine-translated `tl` strings.

## Sequencing for new work

Per the approved plan, services land in this order: **exchange-rate → persistence → notifications + subscriptions (parallel) → Android scaffold → Web refactor**.

Progress:
- ✅ **exchange-rate** (iOS) — real spot/historical via Frankfurter; per-provider quotes deferred (see exchange-rate spec).
- ✅ **persistence** (iOS) — SwiftData `PersistenceService`. ⚠️ not yet compiled/run (no `.xcodeproj`, no Swift toolchain on the dev box) — needs an Xcode build to verify.
- ⏭️ **next: notifications + subscriptions** (parallel) — both still stubs in `Services.swift`; see [`docs/services/notifications.md`](docs/services/notifications.md) and [`docs/services/subscriptions.md`](docs/services/subscriptions.md).
