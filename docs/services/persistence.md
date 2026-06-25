# Service: Persistence

Local data the user owns: profile, alerts, favorites, recent providers, cached quotes/rates.

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md) (every entity below mirrors a model)
- **Future:** ⏳ backend sync of `UserProfile`, `RateAlert`, `FavoriteProvider` once accounts exist

## Used by
- [alerts](../modules/alerts.md), [profile](../modules/profile.md), [settings](../modules/settings.md), [onboarding](../modules/onboarding.md), [provider-details](../modules/provider-details.md) (favorites), [home](../modules/home.md) (cached quote read on cold start), [comparison](../modules/comparison.md) (cached recents)

## Entities (shared schema)

| Entity | Notes |
|---|---|
| `UserProfile` | one row; updated on edit |
| `RateAlert` | many; CRUD from Alerts module |
| `FavoriteProvider` | `(providerID, addedAt)` |
| `RecentProvider` | `(providerID, lastViewedAt)`, capped at 10 |
| `CachedQuote` | `(pair, amount, fetchedAt, payload)` — for offline view |
| `CachedHistorical` | `(pair, range, fetchedAt, payload)` |
| `Setting` | key-value, used by [settings](../modules/settings.md) |

## Per-platform impl

| Platform | Tech |
|---|---|
| iOS | **SwiftData** (iOS 17+). One `ModelContainer` in `SendRateApp.swift`. |
| Android | **Room** with KSP. DAOs per entity. |
| Web | **IndexedDB via Dexie**. One DB, one table per entity. |

## Migrations

- iOS: SwiftData schema versioning.
- Android: Room auto-migrations where possible, manual otherwise.
- Web: Dexie version bumps.

Cross-platform schema changes require an updated entity in this file first, then per-platform PRs.

## What NOT to persist locally

- Affiliate URLs (always fetched fresh — they may expire).
- Subscription entitlement (source of truth is StoreKit/Play/Stripe; cached only).
- Sponsored offers (server controls eligibility).

## Backup / sync

Out of scope for v1. Once accounts exist, server-synced sync of alerts + favorites becomes the spec.

## Wiring

ViewModels never touch the persistence library directly — they call `PersistenceService.<entity>.<verb>()` so the underlying store can swap without touching feature code.
