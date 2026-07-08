# Proveedores España → Filipinas (investigación de fiabilidad)

## Dependencies
- **Reads:** — (investigación primaria)

## Used by
- [exchange-rate](services/exchange-rate.md) — la lista "100% fiables" alimenta el `trustScore` editorial (`web/lib/services/trust.ts`)
- Selección de futuros proveedores directos

## 100% fiables

Todos regulados en UE/España con corredor EUR→PHP activo.

**Métodos de cobro en PH** (lo que *ofrece* el proveedor, no lo que hoy cotiza nuestra
integración — esa cobertura por método está en [exchange-rate → Delivery-method
support](services/exchange-rate.md#delivery-method-support-per-source)). Leyenda:
🏦 banco · 💵 efectivo (agente) · 📱 wallet (GCash/Maya/GrabPay/ShopeePay) · 🏠 domicilio.

| Proveedor | 🏦 | 💵 | 📱 | 🏠 | Notas de método |
|---|:-:|:-:|:-:|:-:|---|
| **Wise** | ✅ | — | ✅ | — | mid-market transparente; wallet GCash/Maya, sin efectivo |
| **Western Union** | ✅ | ✅ | ✅ | — | mayor red mundial, cobertura total PH incl. GCash |
| **MoneyGram** | ✅ | ✅ | — | — | como WU, gran red de agentes en PH |
| **Remitly** | ✅ | ✅ | ✅ | — | especialista en remesas, fuerte en PH |
| **WorldRemit** | ✅ | ✅ | ✅ | ✅ | GCash, GrabPay, Maya, ShopeePay directos; 5 payouts incl. domicilio |
| **Ria** | ✅ | ✅ | ✅ | — | una de las mayores redes de efectivo, wallets PH |
| **Xoom (PayPal)** | ✅ | ✅ | ✅ | ✅ | banco/GCash, efectivo y entrega a domicilio en PH |
| **Moneytrans** | ✅ | ✅ | ✅ | — | BDO (banco), Cebuana Lhuillier/MLhuillier (efectivo), GCash (wallet) |
| **TransferGo** | ✅ | ✅ | ✅ | — | banco + GCash/Maya; API lista también efectivo y tarjeta según disponibilidad live |
| **Instarem (Nium)** | ✅ | ✅ | — | — | banco + 21k+ puntos de efectivo en PH |
| **XE Money Transfer** | ✅ | — | ✅ | — | corredor activo, wallets PH |
| **CurrencyFair** | ✅ | — | — | — | broker FX, **solo banco-a-banco** |
| **OFX** | ✅ | — | — | — | solo banco; margen cambiario más alto (cara, no dudosa) |
| **Revolut** | ✅ | — | — | — | solo SWIFT genérico, sin red de efectivo ni GCash (ver "dudosos") |
| **Correos Giro Int'l (Eurogiro)** | — | ✅ | — | — | recogida/entrega en agencia postal, entidad pública |

Detalle adicional por proveedor:

- **Wise** — alto volumen; fuente directa integrada (`api.wise.com/v3/quotes`).
- **CurrencyFair** — EUR→PHP confirmado; fuente directa integrada T22 (2026-07-06, `api.currencyfair.com/comparisonQuotes`).
- **TransferGo** — FCA/EU, Trustpilot 4★ +38k reseñas; fuente directa integrada.
- **Instarem (Nium)** — multi-jurisdicción, +2M clientes.
- **Moneytrans** — regulada BE+ES, muy usada por la comunidad filipina en España.
- ~~**Small World (Sigue)** — histórica en el corredor ES-PH~~ — **cesó operaciones en 2026** (Sigue con orden de cese en marzo 2026; Small World Financial Services en administración especial desde el 18 de junio de 2026, confirmado T22 2026-07-06); ambos dominios ya no operan el producto — retirar de "100% fiables".

## Dudosos (verificar antes de integrar)

- **Azimo** — adquirida por Papaya Global (B2B nómina) en 2022; ¿sigue activo el producto de consumo en España?
- **iRemit/IREMITX** — regulada por BSP, presencia en IT/FR/CH pero sin licencia confirmada en España; tarifas opacas
- **Sendwave** — emisores foco US/UK; ¿opera desde España?
- **PandaRemit** — Singapur, ~850 reseñas, sin licencia clara en España
- **Paysend** — modelo tarjeta-a-tarjeta; ¿soporta efectivo/GCash/banco en PH?
- **Revolut** — coste real difícil de comparar (SWIFT genérico)
- **Agencias locales/informales no registradas** — fuera del ámbito por definición

## Antes de integrar un proveedor

Confirmar (1) registro en el Banco de España (entidades de pago / dinero electrónico), (2) corredor EUR→PHP activo en su web, (3) métodos de cobro soportados (banco, efectivo, GCash/Maya/GrabPay/ShopeePay).
