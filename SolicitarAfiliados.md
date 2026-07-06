# Solicitar Afiliados — Guía completa

## Resumen rápido

| # | Proveedor | Plataforma | Tipo | Comisión | Cookie | Prioridad |
|---|---|---|---|---|---|---|
| 1 | Wise | Partnerize | CPA | £10-50 por cliente | 1 año | Alta |
| 2 | Remitly | FlexOffers / Directo | CPS | $1.60-20 por transfer | 30 días | Alta |
| 3 | Western Union | Partnerize / Admitad | CPA | €7-8 por venta | 30 días | Alta |
| 4 | TransferGo | Impact Radius / FinanceAds | CPA | £20 por cliente | 30 días | Alta |
| 5 | Instarem | Partnerize / FlexOffers | CPA | $2.40-12 según red | 10-30 días | Alta |
| 6 | MoneyGram | CJ Affiliate | CPA | $5-8 por orden | 30 días | Media |
| 7 | TorFX | Programa propio | Rev-share | ~20% turnover lifetime | — | Media |
| 8 | Currencies Direct | Partner Portal | Rev-share | % profit/turnover | — | Media |
| 9 | OFX | Programa propio | Rev-share | % Gross Revenue | 24 meses | Media |

**Archivos a modificar tras obtener URLs:**
- Proveedores → `web/lib/data/providers.ts` → campo `affiliateURL`
- Brokers → `web/lib/brokers.ts` → campo `url`

> ⚠️ Hoy `providers.ts` solo tiene entrada para Wise, Remitly, Western Union y TransferGo. Instarem y MoneyGram se añaden en T19 (`docs/plan/T19-provider-coverage.md`) — si consigues sus URLs antes, guárdalas en el checklist de abajo hasta que exista la entrada.

---

## 1. WISE

### Cómo funciona el programa

Wise paga un **CPA (Cost Per Acquisition)** por cada nuevo cliente que se registre con tu link y complete una **transacción cross-currency** (transferencia entre divisas o gasto con tarjeta Wise en moneda diferente).

### Cómo se gana

1. Un usuario hace click en tu link de afiliado
2. Se registra en Wise (cuenta nueva, sin cuenta previa)
3. Completa una transacción cross-currency que iguale o supere el monto mínimo
4. Wise verifica la transacción y te paga la comisión

**Transacciones que califican:**
- Transferencias internacionales (ej: EUR → PHP)
- Top-up con conversión de moneda en cuenta Wise
- Gasto con tarjeta Wise en moneda diferente

**NO califican:**
- Transferencias misma moneda (EUR → EUR)
- Conversiones manuales entre cuentas Wise
- Retiros de cajero (ATM)
- Pagos de gambling/casino
- Pagos a instituciones financieras, gobierno o impuestos

### Cuánto se gana

| Concepto | Comisión |
|---|---|
| **Personal (SEO/web)** | £10 por cliente que transfiera/gaste ≥£200 |
| **Business** | £50 por cliente business |
| **EUR (para tu caso)** | €250 mínimo de transacción para calificar |

**Cookie:** 1 año (365 días) — si el usuario convierte dentro de 12 meses del click, cobras. La más larga del sector.

**Revisión:** Wise revisa el programa cada 6 meses. Si traes alto volumen o usuarios de alto valor, pueden aumentar tu comisión.

### Requisitos

| Requisito | Detalle |
|---|---|
| **General** | Tener presencia online (web, blog, YouTube, redes) |
| **Aprobación** | Evalúan caso por caso |
| **Restricciones** | No pujar por marca en Google Ads, no coupons de transfer gratis, no redirect automático |
| **Permitido** | SEO, artículos, vídeos, redes sociales, email |
| **Invoice** | Necesitas enviar factura para cobrar (puedes usar tu cuenta Wise) |

### Registro

1. https://join.partnerize.com/wise/en → crear cuenta Partnerize
2. Seleccionar "Website Partnerships"
3. Esperar aprobación (2-5 días)
4. Tu link: Wise app → sección "Earn" → copiar link
5. Contacto: partnerwise@wise.com

---

## 2. REMITLY

### Cómo funciona el programa

Remitly paga un **CPS (Cost Per Sale)** por cada nuevo usuario que se registre con tu link y complete su **primera transferencia internacional** de mínimo $100.

### Cómo se gana

1. Usuario hace click en tu link
2. Se registra en Remitly (cuenta nueva)
3. Completa su primera transferencia de ≥$100
4. Remitly verifica y te paga

### Cuánto se gana

| Corredor | Comisión |
|---|---|
| **UK → India/Pakistan** | $2.80 |
| **Canadá → India** | $4.48 |
| **USA → India** | $8.40 |
| **USA → Resto del mundo** | $10.08 |
| **Europa → Resto del mundo** | $11.20 |
| **Europa → Philippines** | ~$11.20 (estimado) |
| **Promedio general** | $5-20 por conversión |

**Payout mínimo:** $25 (transferencia) / $1,000 (wire)

### Requisitos

| Requisito | Detalle |
|---|---|
| **General** | Web o blog sobre finanzas, remesas, expatriados |
| **Transferencia mínima** | $100 por usuario referido |
| **GEO válidos** | AT, CA, DE, IT, UK, US, UAE, NL, CZ, NO, GR, DK, SK, IE, PT, FI, NZ, FR, AU, MT, SG, LT, SE, **ES**, CY, PL |
| **Restricciones** | No PPC, no incentivizado, no coupons de terceros, no popup |
| **Permitido** | SEO, contenido orgánico, email marketing |

### Registro

**Opción A — Directo:** https://www.remitly.com/us/en/landing/partner-program
**Opción B — FlexOffers:** https://www.flexoffers.com/affiliate-programs/remitly-affiliate-program/

---

## 3. WESTERN UNION

### Cómo funciona el programa

Western Union paga un **CPA** por cada nuevo cliente que se registre con tu link y complete una transacción en la plataforma (web o app).

### Cómo se gana

1. Usuario hace click en tu link
2. Se registra en Western Union online
3. Completa una transferencia o transacción
4. WU verifica y te paga

### Cuánto se gana

| Red | Comisión | Cookie |
|---|---|---|
| **Partnerize (directo)** | ~€8.21 por venta | 30 días |
| **Admitad** | €7.00 por venta | 30 días |
| **FlexOffers (SE)** | 160 SEK por venta | 7 días |
| **Otros CPA** | $1.25-$6.30 según GEO | Variable |

### Requisitos

| Requisito | Detalle |
|---|---|
| **General** | Web, blog, app, YouTube con audiencia relevante |
| **Restricciones** | No pujar por marca en SEM, contenido apropiado |
| **Permitido** | SEO, email, redes sociales, contenido |
| **Recursos** | Banners, creativos, APIs de reporting |

### Registro

1. https://www.westernunion.com/gb/en/become-an-affiliate.html → "Join now"
2. Registro en Partnerize
3. Contacto: WesternUnionEMEA@partnerize.com

---

## 4. TRANSFERGO

### Cómo funciona el programa

TransferGo paga un **CPA fijo** por cada nuevo usuario que se registre con tu link y complete su primera transferencia de mínimo £50.

### Cómo se gana

1. Usuario hace click en tu link
2. Se registra en TransferGo (cuenta nueva)
3. Completa transferencia de ≥£50
4. TransferGo verifica y te paga £20

### Cuánto se gana

| Concepto | Comisión |
|---|---|
| **CPA fijo** | £20 por nuevo cliente |
| **Requisito transferencia** | Mínimo £50 |
| **Cookie** | 30 días |

### Requisitos

| Requisito | Detalle |
|---|---|
| **General** | Web con contenido relevante (finanzas, remesas, expatriados) |
| **Audiencia** | Acepta afiliados de todo el mundo |
| **Tracking** | Real-time, deep linking disponible |
| **Recursos** | Banners localizados, vídeos, artículos |

### Registro

**Opción A — FinanceAds:** https://www.financeads.com/programs/transfergo_int/
**Opción B — Impact Radius:** https://app.impact.com (buscar "TransferGo")

---

## 5. INSTAREM

### Cómo funciona el programa

Instarem paga un **CPA** por cada nuevo usuario que se registre y complete su primera transferencia.

> ⚠️ No confundir con el **refer-a-friend de consumidores** (40 EUR / 50 USD / 40 GBP + InstaPoints, límite 10 referidos): ese bonus lo cobra el usuario desde su cuenta personal de Instarem, no el afiliado. No es apilable con el CPA.

### Cómo se gana

1. Usuario hace click en tu link
2. Se registra en Instarem (cuenta nueva)
3. Completa su primera transferencia internacional
4. Instarem verifica y te paga el CPA

### Cuánto se gana

| Red | Comisión |
|---|---|
| **FlexOffers** | $12 por transacción + $2.40 por sign-up (cookie 10 días) |
| **CloudTraffic** | $7.70 por conversión |
| **Indoleads** | $7 por conversión |
| **Multi-geo** | $3.89 - $5 por conversión |

**Payout:** Comisión del mes anterior se paga el 25 del mes siguiente (~30 días).

### Requisitos

| Requisito | Detalle |
|---|---|
| **General** | Web, blog, YouTube, redes sociales |
| **Audiencia** | Worldwide (EU, US, UK, AU, SG, CA, JP, HK, MY) |
| **Restricciones** | No brand bidding en SEM, no direct linking, no coupons |
| **Permitido** | SEO, PPC (no brand), email, redes sociales, push notifications |
| **Cookie** | 30 días |

**GEOs soportados:** Australia, Canadá, US, UK, Europa (ES incluido), Singapur, Malasia, Japón, Hong Kong.

### Registro

**Opción A — Partnerize:** https://signup.partnerize.com/signup/en_au/instaremglobal (acceso inmediato al tracking link)
**Opción B — FlexOffers:** https://www.flexoffers.com/affiliate-programs/instarem-affiliate-program/ (mejor CPA; misma cuenta que Remitly)
Contacto para alto volumen: affiliate@nium.com

---

## 6. MONEYGRAM

### Cómo funciona el programa

MoneyGram paga un **CPA** por cada nuevo usuario que se registre y complete una transacción en la plataforma.

### Cómo se gana

1. Usuario hace click en tu link
2. Se registra en MoneyGram online
3. Completa una transferencia o transacción
4. MoneyGram verifica y te paga

### Cuánto se gana

| Red | Comisión | Notas |
|---|---|---|
| **CJ Affiliate** | $5 por orden | Programa principal |
| **Affplus/Opinion Universe** | $6.50 - $15 CPA | Varía por GEO |
| **Otros CPA** | $0.11 - $70 | Altísima variabilidad |

### Requisitos

| Requisito | Detalle |
|---|---|
| **General** | Web con audiencia en finanzas/remesas |
| **Restricciones** | No usar "secure/safe/deposit" — usar "reliable/convenient/transfer/send", no brand bidding |
| **Permitido** | SEO, email, redes sociales |
| **GEO principal** | US (también ES, AU, CA, FR, DE, IT) |

### Registro

1. https://signup.cj.com/member/signup/publisher/ → crear cuenta CJ Affiliate
2. Buscar "MoneyGram" en advertiser directory
3. Aplicar y esperar aprobación

---

## 7. TORFX (Brokers — Introducer)

### Cómo funciona el programa

TorFX paga un **rev-share lifetime** — recibes un porcentaje del **turnover o profit** de cada cliente que refieras, **mientras siga operando** con TorFX. A diferencia de los CPA (pago único), esto es ingreso recurrente.

### Cómo se gana

1. Refieres un cliente a TorFX (a través de tu link o formulario)
2. El cliente abre cuenta y empieza a hacer transacciones
3. TorFX te paga un % del volumen de cada transacción del cliente
4. **Lifetime:** mientras el cliente siga operando, sigues cobrando

### Cuánto se gana

| Concepto | Comisión |
|---|---|
| **Rev-share** | ~20% del turnover/profit (según Oxbridge/TorFX docs) |
| **Tipo** | Lifetime — por cada trade del cliente |
| **Payout** | Variable según volumen del cliente |
| **Segundo nivel** | Puedes referir otros partners y cobrar la diferencia de comisión |

**Ejemplo:** Si refieres un cliente que mueve €50,000/año y TorFX gana 1% (~€500), tú cobras ~€100/año por ese cliente. Con 50 clientes activos = €5,000/año recurrente.

### Requisitos

| Requisito | Detalle |
|---|---|
| **General** | Negocio o presencia online (web, consultoría, servicios financieros) |
| **Importante** | Confirmar que TorFX cubre EUR→PHP (no todos los brokers manejan este corredor) |
| **Portal** | Partner portal con tracking de comisiones |
| **Manager** | Te asignan Partnership Manager dedicado |

### Registro

1. https://partner.torfx.com/register/ (portal UK/EU — entidad regulada por la FCA; usar este desde España, **no** el `.com.au`, que es la entidad australiana)
2. Completar formulario
3. Esperar aprobación
4. Email: partners@torfx.com · Info: https://www.torfx.com/partners

---

## 8. CURRENCIES DIRECT (Brokers — Introducer)

### Cómo funciona el programa

Currencies Direct paga un **rev-share** — recibes un porcentaje del turnover o profit de cada cliente referido. Modelo lifetime como TorFX.

### Cómo se gana

1. Refieres un cliente a Currencies Direct
2. El cliente abre cuenta y opera
3. CD te paga un % de sus transacciones
4. **Lifetime:** ingreso recurrente por cada cliente activo

### Cuánto se gana

| Concepto | Comisión |
|---|---|
| **Rev-share** | % de turnover o profit (negociable) |
| **Tipo** | Lifetime — por cada trade del cliente |
| **APIs** | 25+ APIs para integración (citas automáticas, referrals, pagos) |

**Nota:** Las comisiones se negocian individualmente según volumen esperado.

### Requisitos

| Requisito | Detalle |
|---|---|
| **General** | Negocio con presencia online o red de contactos |
| **Portal** | Partner Portal propio con tracking |
| **Manager** | Account manager dedicado |
| **APIs** | Disponibles para integración directa |

### Registro

1. https://partners.currenciesdirect.com/Affiliate/AffiliateRegistration?source=CD
2. O https://www.currenciesdirect.com/en-gb/partners → "Become a partner"
3. Teléfono: +44 (0) 20 7847 9400

---

## 9. OFX (Brokers — Referral)

### Cómo funciona el programa

OFX paga un **rev-share** por cada "Qualifying Transaction" de los clientes que refieras. Duración de 24 meses por cliente.

### Cómo se gana

1. Refieres un cliente vía tu link
2. El cliente se registra y completa una transferencia
3. OFX te paga un % del Gross Revenue generado
4. **Duración:** 24 meses desde la primera transacción del cliente

### Cuánto se gana

| Concepto | Comisión |
|---|---|
| **Rev-share** | % de Gross Revenue por Qualifying Transaction |
| **Duración** | 24 meses máximo por cliente |
| **Threshold** | AUD $500 mínimo para payout |
| **Payout** | Dentro de 10 días hábiles del mes siguiente |
| **Herramientas** | Rate widgets gratuitos para web |

### Requisitos

| Requisito | Detalle |
|---|---|
| **General** | Web, blog, app con audiencia en finanzas |
| **Manager** | Alliance Manager dedicado |
| **Widgets** | Rate widgets gratuitos para integrar en tu web |
| **Tracking** | Link de referral único |

### Registro

1. https://www.ofx.com/en-us/partner-with-us/referral-program/ → "Contact us"
2. Completar formulario
3. Esperar aprobación y asignación de Alliance Manager

---

## Checklist de seguimiento

| Proveedor | Fecha solicitud | Estado | URL obtenida | Fecha pegada en código |
|---|---|---|---|---|
| Wise | | ⬜ Pendiente | | |
| Remitly | | ⬜ Pendiente | | |
| Western Union | | ⬜ Pendiente | | |
| TransferGo | | ⬜ Pendiente | | |
| Instarem | | ⬜ Pendiente | | |
| MoneyGram | | ⬜ Pendiente | | |
| TorFX | | ⬜ Pendiente | | |
| Currencies Direct | | ⬜ Pendiente | | |
| OFX | | ⬜ Pendiente | | |

**Estados:** ⬜ Pendiente · 🟡 Solicitud enviada · 🟢 Aprobado · 🔴 Rechazado

---

## Comparativa rápida: CPA vs Rev-share

| Tipo | Ejemplos | Ventaja | Desventaja |
|---|---|---|---|
| **CPA (pago único)** | Wise, Remitly, WU, TransferGo, Instarem, MoneyGram | Pago inmediato por conversión | Solo cobras una vez por cliente |
| **Rev-share (recurring)** | TorFX, Currencies Direct, OFX | Ingreso lifetime mientras cliente opere | Más lento de activar, depende del volumen del cliente |

**Recomendación:** Los CPA (proveedores) dan revenue rápido al lanzar. Los brokers dan revenue recurrente a largo plazo. Idealmente tener ambos.

---

## Notas importantes

1. **EUR→PHP es un corredor específico** — confirma que cada proveedor lo cubre antes de aplicar
2. **Brokers necesitan volumen** — los programas de TorFX, CD y OFX son más flexibles con tráfico bajo al inicio
3. **Wise, WU e Instarem usan Partnerize** — una sola cuenta de Partnerize sirve para los tres; igualmente Remitly e Instarem comparten FlexOffers
4. **Las comisiones de brokers son recurrentes** — a diferencia de los CPA, los brokers pagan por cada trade del cliente referido (lifetime)
5. **Prueba antes de pegar URLs** — verificar en local que cada link trackea (llega a la landing del proveedor con tu ID) antes de deployar
6. **MoneyGram no sirve para EUR→PHP directamente** — su programa fuerte es US; incluirlo como opción alternativa
7. **Instarem cubre España** — está en la lista de GEOs válidos para el programa de afiliados
