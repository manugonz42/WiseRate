# Architecture Overview

## Dependencies
- **Reads:** — (entry doc)
- **Future:** ⏳ backend topology diagram once API is live

## Used by
- [README](../README.md) — first stop for new contributors; all [platforms](../platforms/) reference the layer model

## What SulitSend is

A rate-comparison app for international money transfers, primary corridor **EUR → PHP**. User enters an amount, sees providers ranked by receive amount / total cost / speed, sets alerts, and taps out via affiliate links (the revenue).

## Three platforms, one spec

`docs/` is the source of truth feeding three native implementations — iOS (SwiftUI) · Web (Next.js) · Android (Compose) — which converge on shared HTTP services (rate · auth · push · IAP).

Layers, identical on every platform:

1. **View** — screen/composable/component. UI only.
2. **ViewModel** — observable state + intents. No UI, no I/O.
3. **Service** — protocol-defined I/O, swappable mock ↔ real.
4. **Model** — plain data types mirroring [data-model](data-model.md).

| Concern | Shared | Per-platform |
|---|---|---|
| Data model | schema | Swift struct / TS interface / Kotlin data class |
| Service contracts | signatures, errors | client implementation |
| Design tokens | values | Colors.swift / CSS vars / Compose theme |
| Copy / i18n | keys + en/es/tl strings | platform string store |
| Navigation | route names + params | router wiring |
| UI components | — | each platform reimplements |

## Current state

See [MODULES.md](../MODULES.md) for the live module × platform table. Broadly: web is the production lead (real quotes, five screens, analytics, KV cache); iOS scaffold is complete on mock quotes with real StoreKit 2 + SwiftData + local notifications; Android is a frozen Compose scaffold on mocks; no backend beyond the `web/` API routes.
