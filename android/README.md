# WiseRate — Android

Jetpack Compose scaffold mirroring the iOS app. **Spec:** [`../docs/platforms/android.md`](../docs/platforms/android.md).

This is a scaffold: every module under [`../docs/modules/`](../docs/modules/) compiles as a stub
`*Screen.kt` with placeholders matching its acceptance criteria. Models, mock data, and design
tokens mirror iOS; service interfaces have **mock** implementations only. Real implementations
(Retrofit/Frankfurter, Room, FCM, Play Billing) follow the same sequencing as iOS.

## Stack
Kotlin 2 · Compose · Material 3 (custom dark theme) · Hilt (KSP) · Room · Retrofit · Nav Compose. minSdk 28 / target 34.

## First-time setup
The binary `gradle/wrapper/gradle-wrapper.jar` is **not** checked in. Generate it once:

```sh
# either: open the android/ folder in Android Studio (it generates the wrapper on sync)
# or, with a system Gradle 8.x installed:
cd android && gradle wrapper --gradle-version 8.9
```

Then install **JDK 17**, the **Android SDK Platform 34**, and a **Pixel 8 API 34** emulator.
Android Studio writes `local.properties` (`sdk.dir=...`) on import — not committed.

## Build / run
```sh
cd android
./gradlew :app:assembleDebug      # compile
./gradlew :app:installDebug       # install on a running emulator/device
```

## Layout
See the folder map in [`../docs/platforms/android.md`](../docs/platforms/android.md). Four layers,
matching iOS: `features/<module>` (View + ViewModel) → `core/service` → `core/model`.
