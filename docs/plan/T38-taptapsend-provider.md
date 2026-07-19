# T38 — Taptap Send: nueva fuente directa tier A (los 5 corredores)

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md) (source table + T22 classification record), `web/lib/services/quotes.ts`, `web/lib/services/providers/` (patrón `buildRequest`/`parseX`/`fetchX` + fixture + vitest)
- **Task deps:** T22 (reglas de agregación, precedencia directa, promo separation)

## Used by
- Comparison list (nueva fila directa en los 5 corredores, incl. AUD), `/api/health`, ficha de afiliados C2 en [afiliados-ejecucion.md](afiliados-ejecucion.md)

## Goal
Añadir Taptap Send como proveedor directo tier A en EUR/GBP/USD/CAD/AUD→PHP. Es el único candidato nuevo que cubre los 5 corredores de la app, con fee 0 hacia PH y Trustpilot 4.7/5 (~36.000 reseñas). Fiabilidad confirmada además por usuario real (contacto de la comunidad, 2026-07-19).

## Evidencia (verificada en vivo 2026-07-19)
- `GET https://api.taptapsend.com/api/fxRates` con cabeceras `Appian-Version: web/2022-05-03.0`, `X-Device-Id: web`, `X-Device-Model: web` → 200, JSON ~330 KB. Son las cabeceras que usa su propia web pública (widget de taptapsend.com — el mismo criterio "XHR del calculador público" que las 4 fuentes originales). Sin cabeceras → 400 `BAD_HEADER`.
- Estructura: `availableCountries[].corridors[]` con `fxRate` (string), `currencyScale`, y `feeSchedule` opcional (tiered/standard). Corredores →PH ese día: EUR 70.00, GBP 82.30, USD 61.00, CAD 43.50, AUD 42.70 — todos sin fee (coherencia cruzada: 70/61 ≈ EUR/USD spot).
- Endpoint secundario `GET https://api.taptapsend.com/api/website/v1/provider-fees` (sin cabeceras) — no necesario para el quote.

## Pre-made decisions
- `providerID: "taptapsend"`. No existe en el feed de Wise Comparisons (fixture EUR-PHP), así que no hay fila que reemplazar — entra como fila nueva, mismo cableado `Promise.allSettled` + precedencia que CurrencyFair en T22.
- **Una llamada sirve para todos los corredores**: el parser recibe el JSON completo y extrae `(from,to)`. País emisor canónico por divisa: EUR→`ES`, GBP→`GB`, USD→`US`, CAD→`CA`, AUD→`AU` (las filas EUR son idénticas entre países emisores — verificado 2026-07-19).
- **receiveAmount** con la regla existente "sender pays exactly X in total": si hay `feeSchedule`, resolver `X' + fee(X') = X` sobre los tramos; hacia PH hoy no hay fee → `receive = X × fxRate`, redondeado a `currencyScale`.
- El feed da tipo por corredor, **no cotización por importe** — aceptable porque el fee schedule viene en la misma respuesta (el precio es lineal por tramo). Documentarlo en la source table como nota (mismo asterisco conceptual que la nota de fee-curve de T22 Deferred).
- Sin promo detectable en el feed → sin `PromoInfo` (su programa de referidos es de consumidor, no precio de primera transferencia).
- Fixture: respuesta real **recortada** a los 5 países emisores canónicos y sus corredores PH (+1 corredor con `feeSchedule` tiered para testear el solver de fee) — 330 KB completos no aportan; anotar el recorte en el test.
- Perfil editorial en `providers.ts`: Trustpilot 4.7/5, ~36.000 reseñas (2026-07-19); fees 0 hacia PH; delivery `bankTransfer` + `mobileWallet` (GCash/Maya); `affiliateURL: null`; **sin `subIdParam`** (programa directo — se pregunta al manager post-aprobación, procedimiento afiliados §0 paso 4).
- Riesgo asumido: endpoint interno no documentado, como WU/Remitly — el fallback silencioso de `quotes.ts` ya cubre la rotura. Versionar la cabecera `Appian-Version` como constante con comentario fechado.

## Steps
1. `web/lib/services/providers/taptapsend.ts` (`buildRequest`/`parseTapTapSend`/`fetchTapTapSend`) + fixture + vitest (incluye caso feeSchedule tiered y caso corredor inexistente → null).
2. Cablear en `quotes.ts` (allSettled + health source `taptapsend`) y en `scripts/capture-fixtures.mjs`.
3. Perfil editorial en `providers.ts` + logo si hay asset razonable.
4. Specs: exchange-rate.md (source table + nota "rate-por-corredor, fee schedule local"), MODULES.md si cambia estado.

## Verify
Quote a 100/500/1000/5000 en EUR→PHP y AUD→PHP contra el widget público de taptapsend.com (documentar aquí, fechado). `/api/quotes` muestra la fila en los 5 corredores; `/api/health` reporta la fuente; `npm test && npm run build && npm run lint`.

## Monetización (no bloquea esta tarea)
Programa de afiliados **directo** (sin red): [Affiliate Partner Terms](https://www.taptapsend.com/terms/affiliate-partner-terms). Sin email público de partnerships — vía [formulario de contacto](https://www.taptapsend.com/contact) + `support@taptapsend.com` pidiendo derivación. Ficha completa: [afiliados-ejecucion.md §3 C2](afiliados-ejecucion.md).
