# Proveedores España → Filipinas (investigación de fiabilidad)

## Dependencies
- **Reads:** — (investigación primaria)

## Used by
- [exchange-rate](services/exchange-rate.md) — la lista "100% fiables" alimenta el `trustScore` editorial (`web/lib/services/trust.ts`)
- Selección de futuros proveedores directos

## 100% fiables

Todos regulados en UE/España con corredor EUR→PHP activo:

- **Wise** — mid-market transparente, alto volumen
- **Western Union** — mayor red mundial, cobertura total PH incl. GCash
- **MoneyGram** — como WU, gran red de agentes en PH
- **Remitly** — especialista en remesas, fuerte en PH
- **WorldRemit** — GCash, GrabPay, Maya, ShopeePay directos
- **Ria** — una de las mayores redes de efectivo, wallets PH
- **Xoom (PayPal)** — banco y efectivo en PH
- **Moneytrans** — regulada BE+ES, muy usada por la comunidad filipina en España; Cebuana Lhuillier, MLhuillier, BDO, GCash
- **TransferGo** — FCA/EU, Trustpilot 4★ +38k reseñas
- **Instarem (Nium)** — multi-jurisdicción, +2M clientes
- ~~**Small World (Sigue)** — histórica en el corredor ES-PH~~ — **cesó operaciones en 2026** (Sigue con orden de cese en marzo 2026; Small World Financial Services en administración especial desde el 18 de junio de 2026, confirmado T22 2026-07-06); ambos dominios ya no operan el producto — retirar de "100% fiables"
- **XE Money Transfer** — corredor activo, wallets PH
- **CurrencyFair** — broker FX regulado, EUR→PHP confirmado, solo banco-a-banco; fuente directa integrada T22 (2026-07-06, `api.currencyfair.com/comparisonQuotes`)
- **OFX** — fiable pero el margen cambiario más alto (cara, no dudosa)
- **Revolut** — envío ES→PH confirmado, pero vía SWIFT genérico sin red de efectivo ni GCash (ver "dudosos")
- **Correos Giro Internacional (Eurogiro)** — entrega en agencia, entidad pública

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
