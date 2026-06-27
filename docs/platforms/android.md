# Platform: Android

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md), [navigation](../architecture/navigation.md), [localization](../architecture/localization.md), all [services](../services/)
- **Future:** ⏳ initial scaffold (not started yet)

## Used by
- Future Android module files (one per [module](../modules/)) will map their paths here

## Status

Not started. This file is the brief for the initial scaffold.

## Target stack

**Kotlin 2 + Jetpack Compose + Material 3 (custom theme) + Hilt + Room + Retrofit + Kotlin Coroutines/Flow**.

Minimum SDK: 28 (Android 9). Target: latest stable.

## Folder layout (target)

```
android/app/src/main/java/com/wiserate/
├── WiseRateApplication.kt
├── di/                     # Hilt modules
├── core/
│   ├── model/              # mirrors data-model.md
│   ├── viewmodel/          # one VM per feature
│   └── service/            # interfaces + impls (rate, persistence, push, billing, analytics)
├── data/
│   ├── mock/               # mirrors MockData.swift (initial parity)
│   ├── remote/             # Retrofit API clients
│   └── local/              # Room DAOs + entities
├── design/
│   ├── theme/              # Color.kt, Type.kt, Spacing.kt
│   └── components/         # Card, PrimaryButton, Avatar, Chip, RateBadge
├── features/<module>/      # Screen.kt + ViewModel.kt + state holders
└── navigation/
    ├── NavGraph.kt
    └── Screen.kt           # sealed class mirroring iOS Route enum
```

## Conventions

- One `@Composable fun <Module>Screen(vm: <Module>ViewModel = hiltViewModel())` per feature.
- `ViewModel` exposes `StateFlow<UiState>` and `fun on<Intent>()` handlers — no LiveData.
- Theming via custom `WiseRateTheme { ... }` wrapping Material 3, mapping tokens from [design-system](../architecture/design-system.md).
- Navigation: Compose Navigation with type-safe args (Kotlin 2 typed nav).

## Parity goal

When this scaffold is built, every module under [`modules/`](../modules/) should compile as a stub `Screen.kt` that renders placeholders matching the spec's acceptance criteria. Real implementation follows the same sequencing as iOS.

## Build / run

Gradle 8.x with Kotlin DSL. Hilt KSP (not kapt). Run on Pixel 8 emulator API 34 as the design target.

## Tooling parity gaps to track

- StoreKit ↔ **Google Play Billing** ([subscriptions](../services/subscriptions.md))
- APNs ↔ **FCM** ([notifications](../services/notifications.md))
- SwiftData ↔ **Room** ([persistence](../services/persistence.md))
