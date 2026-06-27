# Platform: Android

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md), [navigation](../architecture/navigation.md), [localization](../architecture/localization.md), all [services](../services/)
- **Future:** ⏳ real service impls (Retrofit/Frankfurter, Room, FCM, Play Billing) — same sequencing as iOS

## Used by
- [navigation](../architecture/navigation.md) — `navigation/NavGraph.kt` + `Screen.kt`
- Each [module](../modules/) → `features/<module>/<Module>Screen.kt` + `<Module>ViewModel.kt`

## Status

**Scaffolded** (code under [`/android`](../../android/)). Buildable Gradle project mirroring the iOS
four-layer architecture: all models / mock data / design tokens ported, service interfaces with
**mock** implementations, full navigation (5-tab bar + push/sheet routes + `wiserate://` deep
links), and every module compiling as a stub `Screen.kt` + `ViewModel.kt` rendering placeholders
that map to each module spec's acceptance criteria. Real service impls are next, following the iOS
sequencing.

Setup note: `gradle/wrapper/gradle-wrapper.jar` is not committed — Android Studio generates it on
first sync, or run `gradle wrapper`. See [`/android/README.md`](../../android/README.md).

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

## ASO

Play Store listing (title/short+full description/keywords/screenshots per en/es/tl) + app links — see [seo.md](../architecture/seo.md).
