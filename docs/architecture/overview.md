# Architecture Overview

## Dependencies
- **Reads:** — (entry doc; references all others)
- **Future:** ⏳ backend topology diagram once API is live

## Used by
- [README](../README.md) — first stop for new contributors
- All [platforms](../platforms/) reference the layer model defined here

## What WiseRate is

A rate-comparison app for international money transfers. Primary corridor: **EUR → PHP**. The user types an amount, sees the best providers ranked by total cost / receive amount / speed, sets alerts, and taps out to the provider via affiliate links.

## Three platforms, one spec

```
                ┌─────────────────────────────┐
                │   docs/  (this folder)      │
                │   ── source of truth ──     │
                └─────────────┬───────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌──────────┐         ┌──────────┐          ┌──────────┐
   │   iOS    │         │   Web    │          │ Android  │
   │ SwiftUI  │         │ Next.js  │          │ Compose  │
   └────┬─────┘         └────┬─────┘          └────┬─────┘
        └─────────────┬──────┴─────────────────────┘
                      ▼
         ┌────────────────────────────┐
         │  Shared services (HTTP)    │
         │  rate · auth · push · IAP  │
         └────────────────────────────┘
```

## Layers (consistent across platforms)

1. **View** — screen / composable / component. UI only.
2. **ViewModel** — observable state + intents. No UI, no I/O.
3. **Service** — protocol-defined I/O (HTTP, persistence, notifications). Swappable mock ↔ real.
4. **Model** — plain data structs/classes mirroring [`data-model.md`](data-model.md).

## What's shared vs platform-specific

| Concern | Shared | Per-platform |
|---|---|---|
| Data model | ✅ schema | type definitions (Swift struct / TS interface / Kotlin data class) |
| Service contracts | ✅ method signatures, errors | client implementation |
| Design tokens | ✅ values (hex, sp, ms) | binding (Color.swift / CSS vars / Compose theme) |
| Copy / i18n | ✅ keys + en/es/tl strings | platform string store |
| Navigation routes | ✅ names + params | router wiring |
| UI components | ❌ | each platform reimplements |

## Current state

- iOS scaffold complete with mock data — see [platforms/ios.md](../platforms/ios.md).
- Web is a 2,416-line single-file HTML prototype — see [platforms/web.md](../platforms/web.md).
- Android: not started.
- No backend yet. Real services are tracked in [services/](../services/).
