# 💱 WiseRate

> Compare money transfer rates and save on international transfers

![Swift](https://img.shields.io/badge/SwiftUI-iOS_17+-F05138?style=for-the-badge&logo=swift&labelColor=1a1b26)
![Next.js](https://img.shields.io/badge/Next.js-15-c0caf5?style=for-the-badge&logo=nextdotjs&labelColor=1a1b26)
![Compose](https://img.shields.io/badge/Jetpack_Compose-Android-3DDC84?style=for-the-badge&logo=android&labelColor=1a1b26)

**Status: pre-launch.** Roadmap and budget: [docs/ROADMAP.md](docs/ROADMAP.md) · Per-module status: [docs/MODULES.md](docs/MODULES.md)

---

## ✨ Features

- 📊 **Real provider quotes** — live prices fetched from Wise, Western Union, Remitly, TransferGo + Wise Comparisons as filler
- 💰 **True-cost comparison** — receive amount normalized so fees and FX markup can't hide
- 🏷️ **Promo-aware** — first-transfer offers shown separately; ranking always uses the standard price
- 📈 **Rate history & analytics** — mid-market trend per corridor (EUR→PHP first)
- 🔔 **Rate alerts** — get notified when rates reach your target

## 🛠 Tech stack

| Platform | Stack | State |
|----------|-------|-------|
| **Web** (`web/`) | Next.js 15 · TypeScript · Tailwind | Compare wired to real quotes via `/api/quotes` |
| **iOS** (`WiseRate/`) | SwiftUI · SwiftData · StoreKit 2 | All screens; Frankfurter rates; quotes still mock |
| **Android** (`android/`) | Jetpack Compose · Room | All screens scaffolded on mock data |
| **Landing** (`landing/`) | Next.js (standalone) | Marketing site for the root domain |

Cross-platform specs live in [`docs/`](docs/README.md) — one spec per module, specs drive code.

## 🚀 Run locally

```sh
# Web app
cd web && npm install && npm run dev     # http://localhost:3000

# Landing
cd landing && npm install && npm run dev

# Android
cd android && ./gradlew assembleDebug
```

iOS: no `.xcodeproj` checked in yet — create an Xcode iOS App project referencing `WiseRate/` (iOS 17+).

## 📫 Contact

Manuel González — [LinkedIn](https://linkedin.com/in/manugonz42) · [GitHub](https://github.com/manugonz42)
