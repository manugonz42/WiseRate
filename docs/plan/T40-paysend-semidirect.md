# T40 — Paysend semi-directo (scrape de landing SSR) — ⚠️ GATEADA por aprobación de afiliado

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md) (T22 classification: Paysend era tier C "login-gated"), `web/lib/services/quotes.ts`
- **Task deps:** T22. **Gate duro:** aprobación del programa de afiliados de Paysend (ficha F2 de [afiliados-ejecucion.md](afiliados-ejecucion.md), `partnership@paysend.com`) — regla T22: scrapers tier B solo con relación de afiliado/partner establecida (legal/ToS). No ejecutar antes.

## Used by
- Comparison list (fila nueva EUR/GBP/USD/CAD→PHP), `/api/health`

## Goal
Añadir Paysend con precio semi-directo. Reclasificación respecto a T22 (2026-07-06, "tier C login-gated"): verificado 2026-07-19 que sus landings por corredor **renderizan el tipo en el HTML del servidor** (sin JS, sin bot wall vía curl): `https://paysend.com/en-es/send-money/from-spain-to-philippines` → `70.1193 PHP` embebido. Fee plano publicado por origen (ES €1,50 / US $1,99 / UK £1). Rate del HTML + fee plano ⇒ receiveAmount calculable para cualquier importe.

## Pre-made decisions
- Es **scraping de HTML** (tier B), no un endpoint JSON: parser defensivo (regex/selector con doble anclaje), fixture del HTML committeada, y si el parse falla → fila ausente en silencio (patrón fallback existente). Nunca romper el agregado.
- Rate-por-corredor + fee plano, como T38: una página por corredor origen (`from-spain`, `from-the-united-kingdom`, `from-the-united-states-of-america`, `from-canada`... verificar slugs y si existe AU en su red de envío al ejecutar).
- Precio estándar vs promo: sus landings a veces muestran "first transfer free" — si el fee scrapeado es el promocional, rankear con el fee estándar publicado y llevar la promo a `PromoInfo` (regla T22; nunca inventar importes).
- `providerID: "paysend"`; perfil editorial + Trustpilot al ejecutar; `subIdParam` se pregunta al manager post-aprobación (programa directo).
- Cache: el rate SSR cambia poco — TTL compartido de 120 s es más que suficiente; no añadir cache propio.

## Steps
1. (Tras aprobación F2) confirmar por escrito con el manager que el uso del rate publicado en el comparador es aceptable — dejar constancia aquí, fechada.
2. Parser + fixture + vitest; cablear en `quotes.ts` + health `paysend`.
3. Perfil editorial + specs (exchange-rate.md: mover Paysend de tier C a tier B con la evidencia fechada).

## Verify
Rate scrapeado == rate del calculador oficial en los corredores servidos, a 2 fechas distintas; receiveAmount a 100/1000 coherente con su app. Gates estándar (`npm test && npm run build && npm run lint`).
