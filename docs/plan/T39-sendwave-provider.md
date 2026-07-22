# T39 — Sendwave: nueva fuente directa tier A (EUR/GBP/USD/CAD→PHP)

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md), `web/lib/services/quotes.ts`, `web/lib/services/providers/` (patrón T01/T22)
- **Task deps:** T22 (promo separation: precio estándar rankea, promo se muestra aparte); T38 recomendado antes solo por orden de valor (AUD)

## Used by
- Comparison list (4 corredores; **no AUD**), `/api/health`, ficha de afiliados B3 en [afiliados-ejecucion.md](afiliados-ejecucion.md)

## Goal
Añadir Sendwave (grupo Zepz, partner oficial de GCash) como proveedor directo tier A. Cotiza **por importe exacto** sin auth y separa él mismo precio estándar y promo — encaje perfecto con la regla de ranking sin promo. Trustpilot ~4.3–4.6/5, ~25.700 reseñas. Fiabilidad confirmada además por usuario real (contacto de la comunidad, 2026-07-19).

## Evidencia (verificada en vivo 2026-07-19)
- `GET https://app.sendwave.com/v2/pricing-public?amount=1000&amountType=SEND&sendCountryIso2=es&sendCurrency=EUR&receiveCountryIso2=ph&receiveCurrency=PHP` (+ header `Accept-Language: en`) → 200 sin auth. Es el endpoint del conversor público de sendwave.com (extraído de su bundle `_app`); el 400 sin params lista los campos requeridos.
- Respuesta clave: `baseExchangeRate: "69.91542"` (estándar), `effectiveExchangeRate: "70.26746"` (con promo), `baseFeeAmount: "0.99"`, `payAmount: "1000.99"`, `campaignsApplied[]` (código `NEW`, "Intro Rate Discount", `adjustmentBps: 50`), `calculationId`.
- `GET https://app.sendwave.com/v2/countries` → emisores con destino PH: BE/DE/ES/FR/IE/IT/PT (EUR), GB, CA, US. **AUD no existe** → el fetcher devuelve null para AUD (fila ausente, como cualquier fuente sin corredor).
- Existe `/v2/pricing-segments` (variantes por segmento) — no necesario en v1.

## Pre-made decisions
- `providerID: "sendwave"`. No está en el feed de Wise Comparisons → fila nueva, cableado idéntico a CurrencyFair/T38.
- País emisor canónico: EUR→`es`, GBP→`gb`, USD→`us`, CAD→`ca` (minúsculas, como usa su web).
- **Ranked price = `baseExchangeRate` + `baseFeeAmount`** (regla T22: el número rankeado es siempre el precio estándar sin promo). Normalización "sender pays exactly X in total": resolver `send + fee(send) = X`; con fee plano 0,99 → `receive = (X − 0.99) × baseExchangeRate`. **Confirmar en Verify que el fee no varía con el importe** (cotizar a 2+ importes); si varía, iterar como en el solver de tramos.
- `campaignsApplied` no vacío → `PromoInfo { kind: "first-transfer" }` con el delta effective−base expresado como en Remitly (texto desde `description`, nunca inventado).
- Es un endpoint por (corredor, importe) → una llamada por quote, igual que WU/Remitly; el cache TTL 120 s de `quotes.ts` ya lo amortigua.
- Fixture real committeado (respuesta completa, es pequeña) + vitest: caso promo presente, caso corredor AUD → null, caso 400.
- Perfil editorial en `providers.ts`: Trustpilot ~4.3–4.6/5, ~25.700 reseñas (2026-07-19); partner oficial GCash ([nota Mynt](https://mynt.com.ph/newsroom/sendwave-gcash-strengthen-global-partnership-to-simplify-remittances-for-ofws)); delivery `bankTransfer` + `mobileWallet` + `cashPickup`; grupo Zepz (mismo grupo que WorldRemit — marcas y filas separadas, sin conflicto); `affiliateURL: null`; `subIdParam: "fobs"` provisional (FlexOffers, mismo estándar que Remitly — **verificar en la aprobación**, checklist README).
- Mismo riesgo de endpoint interno que el resto de directos; fallback silencioso ya cubre.

## Steps
1. `web/lib/services/providers/sendwave.ts` + fixture + vitest.
2. Cablear en `quotes.ts` (allSettled + health `sendwave`) y `capture-fixtures.mjs`.
3. Perfil editorial en `providers.ts`.
4. Specs: exchange-rate.md source table, MODULES.md si cambia estado.

## Verify
Quote a 100/500/1000/5000 EUR→PHP contra el conversor público de sendwave.com (documentar aquí, fechado; confirma también si el fee escala). `/api/quotes` en EUR/GBP/USD/CAD muestra la fila con el precio estándar rankeado y badge "FIRST TRANSFER" cuando aplique; AUD sin fila; `/api/health` la reporta; `npm test && npm run build && npm run lint`.

### Revisión 2026-07-22
Parser correcto (nombres de campo verificados contra la respuesta en vivo; el fixture sí es real, a diferencia del de T38). Un fallo sí encontrado: **CAD→PHP a 1000 devuelve 400 `pricing-limit-violation`** (tope del corredor entre 940 y 950 CAD), y `fetchSendwave` lo lanzaba como error → `/api/health` marcaba la fuente caída y se logueaba un error espurio. Ahora ese código concreto se trata como "sin quote a este importe" → `null`, igual que AUD. Cualquier otro estado sigue lanzando. Smoke live a 1000: EUR 69,83 · GBP 82,24 · USD 60,95 (promo "Intro Rate Discount" activa en los tres) · CAD sin fila · AUD sin fila.

## Monetización (lanzar en paralelo, no bloquea)
Programa en **FlexOffers** — misma cuenta que Remitly: [Sendwave Affiliate Program](https://www.flexoffers.com/affiliate-programs/sendwave-affiliate-program/). Ficha completa: [afiliados-ejecucion.md §3 B3](afiliados-ejecucion.md).
