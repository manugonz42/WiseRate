# Platform: iOS (SwiftUI)

## Dependencies
- **Reads:** [data-model](../architecture/data-model.md), [design-system](../architecture/design-system.md), [navigation](../architecture/navigation.md), [localization](../architecture/localization.md), all [services](../services/)
- **Future:** ⏳ `AppContainer` for proper DI (post-persistence)

## Used by
- Every iOS file under `WiseRate/` follows the conventions here
- Each [module](../modules/) maps its iOS path here in its Platform notes

## Folder layout (current)

```
WiseRate/
├── App/                          # entry point
│   └── WiseRateApp.swift
├── Core/
│   ├── Models/{Models,Enums}.swift
│   ├── ViewModels/ViewModels.swift   # all VMs in one file (split later)
│   └── Services/Services.swift        # all service protocols + mocks
├── Data/Mock/MockData.swift           # 15 mock providers + quote generator
├── Design/
│   ├── Theme/{Colors,Typography}.swift
│   └── Components/{Common,Input}/
├── Features/<Module>/<Module>View.swift
└── Navigation/AppRouter.swift
```

## Conventions

- **One view per feature folder** today. Split into subviews when the file exceeds ~400 lines.
- **All ViewModels** live in `Core/ViewModels/ViewModels.swift`. To split: one file per feature under `Features/<Module>/<Module>ViewModel.swift`.
- **All services** are protocols with mock + real impls under `Core/Services/`. Inject via initializer; default to `.shared` for now.
- **State**: `@StateObject` for owned VMs, `@EnvironmentObject` for NavigationState.
- **Concurrency**: ViewModels marked `@MainActor`; services use `async/await`.

## Dependency injection

No framework yet. Services exposed as singletons (`ExchangeRateService.shared`). ViewModels accept them as init params with a default:

```swift
init(rateService: ExchangeRateService = .shared) { ... }
```

Plan: keep this until persistence lands, then introduce a lightweight `AppContainer` struct passed via `Environment`.

## Targets

- iOS 17.0+ minimum (SwiftData requires it).
- iPhone only initially; iPad pass-through layout.

## Build / run

Open the project in Xcode (no `.xcodeproj` committed yet — file references only). Run on simulator: iPhone 15 Pro is the design target.

## Local testing

- Snapshot tests for each feature view (TBD: pick swift-snapshot-testing).
- Unit tests for ViewModels' sort/filter logic.
- UI tests on critical flows (Onboarding → Home → Compare → ProviderDetail → outbound).

## Known stubs to replace

- `ExchangeRateService` — fixed 63.50 EUR→PHP with ±0.5 jitter; see [exchange-rate](../services/exchange-rate.md).
- `TransferProviderService` — reads from `MockData.swift`.
- `NotificationService` — empty bodies; see [notifications](../services/notifications.md).
- `SubscriptionService` — always `.free`; see [subscriptions](../services/subscriptions.md).
- `AnalyticsService` — `print()` only; see [analytics](../services/analytics.md).
