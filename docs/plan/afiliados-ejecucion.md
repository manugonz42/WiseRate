# Afiliados — Plan de ejecución (paso a paso, por proveedor)

## Dependencies
- [`SolicitarAfiliados.md`](../../SolicitarAfiliados.md) (raíz) — investigación por proveedor: comisiones, redes, contactos. Este doc no la repite; la ejecuta.
- Web en producción: https://app.sulitsend.com (live 2026-07-14) — "the live site is the credential".
- ⏳ Vídeo demo HyperFrames (§2 — producción es tarea aparte; no bloquea los grupos A–C).
- ⏳ Email de contacto real `hello@sulitsend.com` (checklist humano del [README](README.md)).

## Used by
- Checklist humano de [`docs/plan/README.md`](README.md) (líneas de affiliate/broker signups).
- Al aprobar cada solicitud: `web/lib/data/providers.ts` (campo `affiliateURL`) y `web/lib/brokers.ts` (campo `url`).

---

## §0 · Datos comunes (rellenar UNA vez, copiar en todas las solicitudes)

### Identidad

| Campo | Valor |
|---|---|
| Nombre / figura fiscal | **Particular (individual)** — decisión 2026-07-14: sin alta de autónomo ni sociedad hasta que haya ingresos suficientes. En los formularios, tipo "Individual / sole trader" y nombre propio en "Company name" (todas las redes lo aceptan) |
| Email de contacto | **growglow.app@gmail.com** (2026-07-14 — el mismo del backend de la app, Vercel y Cloudflare; usarlo en TODAS las redes para no fragmentar cuentas). Para el email público del sitio (`CONTACT_EMAIL`), ideal `hello@sulitsend.com` vía Cloudflare Email Routing → forward a growglow.app@gmail.com |
| País | España |
| Web principal | `https://app.sulitsend.com` |
| Web secundaria | `https://sulitsend.com` (landing/marketing) |
| Método de cobro | **Cuenta Wise personal multi-divisa** (gratis) — da datos bancarios locales en GBP (Partnerize/Wise paga en £), USD (FlexOffers) y EUR (IBAN), evitando la conversión del banco español. En cada red, dar los datos de la divisa en que pague esa red. Los formularios de alta normalmente **no piden datos de cobro** — se añaden después en el panel, al acercarse al primer payout. Fallback: PayPal (peores fees, solo si una red no admite transferencia) |

### Escalado fiscal (decisión 2026-07-14: empezar como particular)

Tres niveles independientes — se activan por disparadores, no por adelantado:

| Nivel | Cuándo | Nota |
|---|---|---|
| **IRPF** | Siempre — declarar todo ingreso de afiliados en la renta anual desde el primer euro | No requiere alta previa |
| **Alta censal (036/037)** | Primer pago que exija emitir factura (Wise la pide; las redes con *self-billing* no) | Gratis, sin cuota; se hace el día que haga falta |
| **RETA (autónomo)** | Ingresos acercándose a nivel SMI anual / actividad habitual | Zona gris jurisprudencial por debajo del SMI — **confirmar con gestor** llegado el momento; tarifa plana al alta |

### Descripción del sitio (EN — pegar en el campo "website description")

> SulitSend (app.sulitsend.com) is a money-transfer comparison site for people sending money from Europe to the Philippines. We compare live quotes — exchange rate, fees, delivery time and delivery methods — across providers for the EUR→PHP corridor, plus GBP/USD/CAD/AUD→PHP. Rankings are based purely on the amount the recipient gets; we publish a full affiliate disclosure at app.sulitsend.com/how-we-make-money.

### Método de promoción declarado (EN)

> Organic SEO and editorial content: corridor comparison pages, provider reviews and rate-trend analytics. Community distribution: the founder is an active member of the Filipino community in Spain, with a large personal network and an established client base from adjacent businesses — the site is promoted through direct recommendations, community groups and word of mouth. No paid search, no brand bidding, no coupon/incentive traffic, no pop-ups.

Coincide con lo permitido por todos los programas — el ángulo comunidad es un **plus** en las solicitudes (audiencia real del corredor EUR→PHP, no tráfico comprado). **Nunca** declarar PPC, coupons o incentivized traffic — varios programas lo prohíben y es causa de rechazo o expulsión.

### Sistema propio de recompensas (idea 2026-07-14 — ⚠️ NO lanzar ni declarar todavía)

**La idea:** usar parte de la ganancia CPA para recompensar a quien traiga usuarios (ej.: cobro €30 de un referido → pago €5–10 a la persona de la comunidad que lo trajo), más un sistema propio de afiliados con ventajas dentro de la app, para expansión rápida vía la red de contactos filipina.

**Por qué está gateado:** eso es *incentivized traffic* / modelo cashback-reward. Remitly lo **prohíbe explícitamente** ("no incentivizado"), Wise prohíbe coupons, y las redes (Partnerize, FlexOffers, Awin, CJ) exigen estar dado de alta como *reward/cashback publisher* con aprobación del anunciante. Hacerlo sin permiso = expulsión del programa + **clawback de todas las comisiones**. Y declararlo en la solicitud inicial, sin tenerlo aún montado, solo resta (es la primera causa de rechazo).

**Camino para activarlo (en orden):**
1. Conseguir las aprobaciones con la declaración actual (SEO + comunidad + word of mouth — todo cierto hoy).
2. Con la cuenta aprobada y las primeras comisiones cobradas, preguntar **por escrito** al affiliate manager de cada programa si aceptan reward/referral model (y sub-affiliates). Activarlo **solo** donde haya OK escrito, y actualizar la declaración de métodos en esa red.
3. Diseñar la recompensa sobre **traer usuarios a SulitSend** (instalar/usar la app), nunca condicionada de cara al usuario a "regístrate en el proveedor X" — la mecánica in-app es el módulo ya especificado en [`docs/modules/referral.md`](../modules/referral.md) (Fase 5; esto la adelantaría).
4. Los pagos a recomendadores salen de la ganancia ya cobrada (autofinanciado) — mantener margen: recompensa ≤ ~1/3 del CPA medio.

### Tráfico (guion de honestidad — pegar cuando pidan "monthly visitors")

> The site launched in July 2026 and is in the early stage of an organic SEO strategy targeting remittance-corridor keywords (e.g. "send money to the Philippines from Europe"). Traffic is currently small but 100% organic and high-intent: every visitor is actively comparing money-transfer providers before making a transfer.

**Nunca inventar cifras.** Si el formulario obliga a elegir un rango numérico, elegir el más bajo ("0–1,000/month").

### Follow-up genérico (EN — enviar a los +7 días hábiles sin respuesta)

> Subject: Following up — SulitSend partner application
>
> Hi,
>
> I applied to your partner programme on [DATE] on behalf of SulitSend (app.sulitsend.com), a live money-transfer comparison site for the Europe→Philippines corridor. I wanted to check whether you need anything else from me to review the application — happy to share more detail about the site, our roadmap, or how providers are displayed.
>
> [SI YA EXISTE EL VÍDEO] Here is a 60-second walkthrough of the product: [VIDEO_URL]
>
> Best regards,
> [NOMBRE]

### Al aprobar cualquier solicitud (procedimiento común)

1. Copiar la URL/link de tracking desde el panel de la red.
2. Pegarla en `web/lib/data/providers.ts` → campo `affiliateURL` del proveedor (brokers: `web/lib/brokers.ts` → campo `url`).
3. Probar en local que el link trackea (aterriza en el proveedor con tu ID visible en la URL/cookie) **antes** de deployar.
4. Deploy + marcar el [checklist §4](#4--checklist-de-seguimiento).
5. **Primer link vivo** → flip de ambos proyectos Vercel a Pro (Hobby prohíbe uso comercial — README checklist).
6. Si el deal incluye bonus de referido para el usuario → poblar también `referralPromo` en `providers.ts` (T22).

---

## §1 · Orden de ejecución

Agrupado por red: **una cuenta desbloquea varios programas**. Ejecutar en orden; dentro de cada grupo, en el orden listado. No esperar la aprobación de un grupo para lanzar el siguiente.

| Paso | Grupo | Programas | Canal |
|---|---|---|---|
| 0 | Prerequisitos | — | — |
| 1 | **A — Partnerize** | Wise → Western Union → CurrencyFair → Instarem* | 1 cuenta Partnerize |
| 2 | **B — FlexOffers** | Remitly → Instarem* | 1 cuenta FlexOffers |
| 3 | **C — Directos** | TransferGo (FinanceAds) | Formulario propio |
| 4 | **D — Brokers** | TorFX → Currencies Direct → OFX | Email/formulario con pitch (esperar al vídeo) |
| 5 | **E — Redes secundarias** | WorldRemit + Xoom (Awin) → MoneyGram (CJ) | 1 cuenta Awin + 1 cuenta CJ |
| 6 | **F — Baja prioridad** | Ria → Paysend → XE → Moneytrans | Formulario/email directo (solo cuando A–E estén en marcha) |

\* **Instarem — decisión:** solicitar vía **FlexOffers** (mejor CPA: $12/transacción + $2.40/sign-up vs multi-geo de Partnerize; misma cuenta que Remitly). Partnerize queda de fallback si FlexOffers rechaza.

Descartados (solo constan en la guía de referencia): Small World/Sigue (ceased 2026), Revolut (sin programa comercial viable).

### Paso 0 — Prerequisitos

- [x] Email de contacto decidido: growglow.app@gmail.com (§0).
- [ ] Crear `hello@sulitsend.com` (Cloudflare Email Routing → growglow.app@gmail.com) y ponerlo en `CONTACT_EMAIL` (`web/lib/site.ts`) — hoy las páginas públicas /about, /terms y /privacy muestran "TODO(human)", mala imagen ante reviewers.
- [ ] Verificar desde **otra red** (móvil/DoH — FortiGuard local bloquea sulitsend.com) que app.sulitsend.com y sulitsend.com cargan sin errores, y que `/how-we-make-money` se ve bien: es la página que mirará todo reviewer.
- [ ] Lanzar la producción del vídeo demo (§2) en paralelo — bloquea solo el grupo D.

---

## §2 · Vídeo demo (spec — producción en tarea aparte con HyperFrames)

- **Formato:** 45–60 s, inglés, sin voz (texto sobre pantalla), 1080p horizontal, sobre la web real en producción.
- **Guion de tomas:**
  1. Home con comparación EUR→PHP en vivo (monto de ejemplo €500) — "Live quotes from real providers".
  2. Podio / best deal — "Ranked by what the recipient actually gets".
  3. Detalle de proveedor (gráfica de tendencia del tipo de cambio) — "Rate history and provider reviews".
  4. Página `/how-we-make-money` — "Fully transparent: commissions never affect rate or ranking". *(La transparencia es lo que más pesa para un reviewer de programa de afiliados.)*
  5. Cierre: logo SulitSend + `app.sulitsend.com`.
- **Hosting:** YouTube unlisted → la URL se referencia como `[VIDEO_URL]` en las plantillas.
- **Dónde se usa:** siempre en emails directos y pitches a brokers (grupo D); en formularios de red **no hay campo de adjunto** — si el campo de descripción lo permite, añadir al final: `Product walkthrough (60s): [VIDEO_URL]`.
- Los grupos A–C **no se bloquean** por el vídeo: se solicita sin él y se enlaza en el follow-up.

---

## §3 · Fichas de ejecución — Grupo A · Partnerize

> Una sola cuenta Partnerize sirve para Wise, Western Union, CurrencyFair e Instarem (fallback). Crear la cuenta con la primera solicitud (Wise) y añadir los demás programas desde el mismo panel.

### A1 · WISE — prioridad nº 1

- **Canal:** https://join.partnerize.com/wise/en → crear cuenta Partnerize → tipo "Website Partnerships". Contacto: partnerwise@wise.com.
- **Enfoque:** comparador transparente que **ya enlaza a Wise orgánicamente** en sus rankings (Wise gana comparaciones EUR→PHP a menudo — el reviewer puede comprobarlo en vivo); la cookie de 1 año encaja con tráfico SEO de intención alta.
- **Qué enviar (campos del formulario):**

| Campo | Respuesta |
|---|---|
| Website URL | `https://app.sulitsend.com` |
| Company / name | §0 identidad |
| Partner type | Website / Content / Comparison |
| Description | Descripción EN del §0 + añadir: *"Wise already appears organically in our EUR→PHP comparison results; an affiliate partnership would let us keep ranking it purely on recipient value while monetising the clicks we already send."* |
| Promotion method | Método de promoción del §0 |
| Traffic | Guion de tráfico del §0 |

- **Vídeo:** no hay campo; añadir `[VIDEO_URL]` al final de la descripción cuando exista.
- **Pasos:** 1) crear cuenta Partnerize → 2) aplicar a Wise → 3) esperar aprobación (2–5 días) → 4) link desde Wise app → sección "Earn" → 5) procedimiento común del §0.
- **Follow-up:** +7 días hábiles a partnerwise@wise.com (plantilla §0).
- **Restricciones:** no brand bidding en Google Ads, no coupons de transfer gratis, no redirect automático. Cobro contra invoice (usar cuenta Wise). Transacción calificante ≥ €250.

### A2 · WESTERN UNION

- **Canal:** https://www.westernunion.com/gb/en/become-an-affiliate.html → "Join now" → mismo login Partnerize. Contacto: WesternUnionEMEA@partnerize.com.
- **Enfoque:** cobertura del corredor Europa→Filipinas con recogida en efectivo (WU es el líder en cash pickup en PH — nuestro comparador muestra delivery methods, donde WU destaca).
- **Qué enviar:** mismos campos que A1; en Description añadir: *"Our comparison surfaces delivery methods (bank deposit, cash pickup, wallets) — a segment where Western Union's Philippines cash-pickup network is a differentiator."*
- **Vídeo:** igual que A1 (link en descripción/follow-up).
- **Pasos:** 1) aplicar desde la cuenta Partnerize existente → 2) esperar aprobación → 3) procedimiento común §0.
- **Follow-up:** +7 días hábiles a WesternUnionEMEA@partnerize.com.
- **Restricciones:** no brand bidding en SEM; comisión ~€8/venta, cookie 30 días.

### A3 · CURRENCYFAIR *(nueva ficha — investigado 2026-07-14; volcado también a `SolicitarAfiliados.md`)*

- **Canal:** https://www.currencyfair.com/affiliate-program → signup vía Partnerize (partner ID de campaña `1011l6561`). Revisión en ~3 días hábiles.
- **Programa:** CPA "competitivo" (importe no publicado — se negocia con el account manager dedicado tras la aprobación) o rev-share opcional. El cliente referido debe transferir ≥ **€1.000** (Minimum Transfer Threshold, personal). Atribución **180 días**. Pago a mes vencido, el 25 (bank wire; PayPal si tu cuenta es USD/AUD/GBP/EUR).
- **Enfoque:** CurrencyFair es nuestro único proveedor **tier A** de cotización directa (T22) — su quote sale en el comparador con el monto exacto; eso es tráfico de máxima intención hacia ellos. ⚠️ No confundir con su refer-a-friend de consumidores (€50 — es bonus de usuario, no CPA de afiliado).
- **Qué enviar:** mismos campos que A1; en Description añadir: *"CurrencyFair is one of the few providers our engine quotes directly at the exact send amount, so your listing shows live, precise pricing — the highest-intent placement on the site."*
- **Vídeo:** link en descripción/follow-up.
- **Pasos:** 1) aplicar desde la cuenta Partnerize → 2) aprobación ~3 días → 3) negociar CPA con el account manager → 4) procedimiento común §0.
- **Follow-up:** +7 días hábiles vía el panel Partnerize (no hay email público).
- **Restricciones:** umbral €1.000 por cliente para cobrar; permiten banners, text links, vídeo embebido y API para afiliados aprobados.

---

## §3 · Fichas — Grupo B · FlexOffers

> Una cuenta FlexOffers sirve para Remitly e Instarem.

### B1 · REMITLY

- **Canal:** https://www.flexoffers.com/affiliate-programs/remitly-affiliate-program/ → crear cuenta FlexOffers → aplicar al programa Remitly. (Vía directa alternativa: https://www.remitly.com/us/en/landing/partner-program — usar solo si FlexOffers rechaza.)
- **Enfoque:** **ES es GEO válido** del programa y Europa→Resto del mundo paga ~$11.20 — exactamente nuestro corredor (EUR→PHP). Remitly es fuerte en Filipinas (wallets GCash, cash pickup), aparece constantemente en nuestro top 3.
- **Qué enviar (campos FlexOffers):**

| Campo | Respuesta |
|---|---|
| Website URL | `https://app.sulitsend.com` |
| Category | Finance / Money Transfer |
| Description | Descripción EN §0 + *"Remitly consistently ranks in our EUR→PHP top results; our audience is remitters in Europe sending to the Philippines — Remitly's core corridor."* |
| Promotion method | Método §0 (marcar solo Content/SEO — **no** marcar PPC ni coupon aunque el formulario los ofrezca) |
| Traffic | Guion §0 (rango más bajo si es select) |

- **Vídeo:** link en descripción/follow-up.
- **Pasos:** 1) cuenta FlexOffers → 2) aplicar a Remitly → 3) aprobación → 4) procedimiento común §0. Payout mínimo $25.
- **Follow-up:** +7 días hábiles vía ticket/soporte de FlexOffers.
- **Restricciones:** transferencia calificante ≥$100; no PPC, no incentivizado, no coupons de terceros, no popups.

### B2 · INSTAREM

- **Canal:** desde la misma cuenta FlexOffers: https://www.flexoffers.com/affiliate-programs/instarem-affiliate-program/. Fallback: Partnerize https://signup.partnerize.com/signup/en_au/instaremglobal (acceso inmediato al tracking link). Alto volumen: affiliate@nium.com.
- **Enfoque:** España está en los GEOs soportados; Instarem cubre EUR→PHP y compite bien en fees bajos — nuestro comparador lo muestra donde gana.
- **Qué enviar:** mismos campos que B1; en Description: *"Instarem competes strongly on low fees in the EUR→PHP corridor we specialise in."*
- **Vídeo:** link en descripción/follow-up.
- **Pasos:** 1) aplicar desde FlexOffers → 2) si rechazan, Partnerize (fallback documentado en §1) → 3) procedimiento común §0. Payout: mes vencido, día 25.
- **Follow-up:** +7 días hábiles; si silencio total, reaplicar por Partnerize.
- **Restricciones:** no brand bidding, no direct linking, no coupons. ⚠️ No confundir con su refer-a-friend de consumidores (40 EUR — no apilable).

---

## §3 · Fichas — Grupo C · Directos

### C1 · TRANSFERGO

- **Canal:** https://www.financeads.com/programs/transfergo_int/ (FinanceAds; alternativa: Impact Radius https://app.impact.com buscando "TransferGo").
- **Enfoque:** CPA fijo claro (£20 por cliente con transfer ≥£50); TransferGo es fuerte con comunidades migrantes en Europa — exactamente nuestra audiencia (filipinos en España/Europa).
- **Qué enviar (campos FinanceAds):**

| Campo | Respuesta |
|---|---|
| Website URL | `https://app.sulitsend.com` |
| Category | Finanzas / Money Transfer |
| Description | Descripción EN §0 + *"Our audience is migrant workers in Europe sending money home — TransferGo's core demographic."* |
| Promotion | Método §0 |

- **Vídeo:** link en descripción/follow-up.
- **Pasos:** 1) cuenta FinanceAds → 2) aplicar a TransferGo → 3) aprobación → 4) procedimiento común §0.
- **Follow-up:** +7 días hábiles vía FinanceAds; segunda vía: aplicar por Impact Radius.
- **Restricciones:** tracking real-time con deep linking disponible (aprovechar: deep-link al flujo EUR→PHP).

---

## §3 · Fichas — Grupo D · Brokers (rev-share lifetime — pitch a persona; esperar al vídeo)

> A los brokers los revisa un partnership manager humano: aquí el email y el vídeo importan más que el formulario. Confirmar cobertura EUR→PHP **en el propio mensaje** (condición del README checklist). Estos ingresos son recurrentes (el único revenue por-transacción sin licencia de pagos — ROADMAP).

### D1 · TORFX

- **Canal:** formulario https://partner.torfx.com/register/ (⚠️ portal UK/EU regulado por FCA — **no** el `.com.au`) + email de refuerzo a partners@torfx.com el mismo día.
- **Enfoque:** nuestra web ya implementa un **carril de brokers** para envíos ≥€5.000 (visible en producción): el tráfico que les mandaríamos es exclusivamente high-value, el segmento que a un broker le interesa.
- **Qué enviar (email EN completo — copiar-pegar):**

> Subject: Introducer application — SulitSend (EUR→PHP comparison site, live)
>
> Hi,
>
> I run SulitSend (app.sulitsend.com), a live money-transfer comparison site for the Europe→Philippines corridor. I've just submitted an introducer application through your partner portal and wanted to introduce myself directly.
>
> Two things that may make this a good fit:
>
> 1. Our site has a dedicated broker recommendation card that only appears for transfers of €5,000 or more — so every referral you'd receive from us is a high-value client, not a retail remitter.
> 2. We rank and present services purely on recipient value, with a public commission disclosure (app.sulitsend.com/how-we-make-money), which keeps referred clients well-qualified and informed.
>
> One question before we go further: can you confirm TorFX covers EUR→PHP transfers for personal clients? That's our core corridor.
>
> Here's a 60-second walkthrough of the product: [VIDEO_URL]
>
> Best regards,
> [NOMBRE] — SulitSend
> [EMAIL] · app.sulitsend.com

- **Vídeo:** **sí**, enlazado en el email (esperar a tenerlo antes de enviar el grupo D).
- **Pasos:** 1) formulario del portal → 2) email anterior a partners@torfx.com → 3) aprobación + Partnership Manager asignado → 4) confirmar EUR→PHP y % rev-share (~20% turnover lifetime) → 5) URL a `web/lib/brokers.ts` + procedimiento común §0.
- **Follow-up:** +7 días hábiles (plantilla §0).
- **Restricciones:** confirmar corredor EUR→PHP antes de activar; posible segundo nivel (referir otros partners).

### D2 · CURRENCIES DIRECT

- **Canal:** https://partners.currenciesdirect.com/Affiliate/AffiliateRegistration?source=CD (alternativa: https://www.currenciesdirect.com/en-gb/partners → "Become a partner"; teléfono +44 20 7847 9400).
- **Enfoque:** igual que TorFX (carril ≥€5.000) + mencionar interés en sus **APIs de partner** (25+, incluyendo referrals) para una integración más profunda a futuro.
- **Qué enviar:** el mismo email de D1 adaptado — sustituir el nombre y añadir tras el punto 2: *"3. Longer term, we'd be interested in exploring your partner APIs for a deeper quote/referral integration."* La comisión es negociable individualmente: no proponer cifra, dejar que la pongan ellos.
- **Vídeo:** sí, en el email.
- **Pasos:** 1) formulario de registro → 2) email/llamada si no responden → 3) negociar rev-share → 4) URL a `brokers.ts` + procedimiento §0.
- **Follow-up:** +7 días hábiles; segunda vía: teléfono.
- **Restricciones:** confirmar cobertura EUR→PHP para clientes personales.

### D3 · OFX

- **Canal:** https://www.ofx.com/en-us/partner-with-us/referral-program/ → "Contact us" (formulario).
- **Enfoque:** igual que D1/D2; OFX además ofrece **rate widgets gratuitos** — mencionar interés (posible integración en el sitio) como valor añadido mutuo. Rev-share de 24 meses por cliente (no lifetime): priorizar TorFX/CD en la conversación si hay que elegir exclusividades.
- **Qué enviar:** email de D1 adaptado; añadir: *"We'd also be interested in your free rate widgets as an additional integration."*
- **Vídeo:** sí, en el email/formulario.
- **Pasos:** 1) formulario "Contact us" → 2) asignación de Alliance Manager → 3) confirmar EUR→PHP → 4) URL a `brokers.ts` + procedimiento §0. Payout: umbral AUD $500, dentro de 10 días hábiles del mes siguiente.
- **Follow-up:** +7 días hábiles.
- **Restricciones:** solo pagan "Qualifying Transactions" durante 24 meses por cliente.

---

## §3 · Fichas — Grupo E · Redes secundarias

> Una cuenta Awin cubre WorldRemit y Xoom; una cuenta CJ cubre MoneyGram. Awin cobra ~£5 de depósito verificación al registrarse (se devuelve con el primer payout).

### E1 · WORLDREMIT (Awin)

- **Canal:** https://www.awin.com/publishers → cuenta publisher → buscar "WorldRemit". Alternativas: Impact (impact.com) o email directo partners@worldremit.com.
- **Enfoque:** WorldRemit es fuerte en Filipinas (wallets + cash pickup); nuestro perfil editorial suyo ya está publicado.
- **Qué enviar (campos Awin):** URL, categoría Finance, descripción EN §0, método de promoción §0. Si se usa el email directo, adaptar el email de D1 quitando la parte de brokers y añadiendo `[VIDEO_URL]`.
- **Vídeo:** solo en la vía email directa.
- **Pasos:** 1) cuenta Awin → 2) aplicar a WorldRemit → 3) aprobación → 4) procedimiento común §0.
- **Follow-up:** +7 días hábiles vía Awin; segunda vía: partners@worldremit.com.
- **Restricciones:** no brand bidding. (El bot wall PerimeterX solo afecta a scrapear su API — irrelevante para el link de afiliado.)

### E2 · XOOM (Awin / PayPal)

- **Canal:** desde la misma cuenta Awin → buscar "Xoom". Alternativa: PayPal Affiliate Network (si tienes cuenta PayPal) o affiliates@xoom.com.
- **Enfoque:** marca PayPal = confianza para remitentes primerizos; cubre EUR→PHP.
- **Qué enviar:** mismos campos que E1.
- **Vídeo:** solo vía email directo.
- **Pasos:** 1) aplicar desde Awin → 2) aprobación → 3) procedimiento común §0.
- **Follow-up:** +7 días hábiles; segunda vía: affiliates@xoom.com.
- **Restricciones:** las estándar de Awin/PayPal (no brand bidding).

### E3 · MONEYGRAM (CJ Affiliate)

- **Canal:** https://signup.cj.com/member/signup/publisher/ → cuenta CJ → buscar "MoneyGram" en el directorio → aplicar.
- **Enfoque:** alternativa de cash pickup consolidada; declarar honestamente el foco EUR→PHP (su programa es fuerte en US — expectativa de volumen moderada, ROADMAP ya lo trata como opción alternativa).
- **Qué enviar (campos CJ):** URL, categoría Financial Services, descripción EN §0, método §0.
- **Vídeo:** no hay campo; link en descripción si cabe.
- **Pasos:** 1) cuenta CJ → 2) aplicar a MoneyGram → 3) aprobación → 4) procedimiento común §0.
- **Follow-up:** +7 días hábiles vía CJ.
- **Restricciones:** ⚠️ **vocabulario prohibido** en el contenido sobre MoneyGram: no usar "secure/safe/deposit" — usar "reliable/convenient/transfer/send". No brand bidding. Revisar el copy del perfil editorial en `providers.ts` antes de activar el link.

---

## §3 · Fichas — Grupo F · Baja prioridad (lanzar solo con A–E en marcha)

> Formato corto: canal + enfoque + envío. Todos usan la descripción/método/tráfico del §0 y el procedimiento común al aprobar. Vídeo: sí en los emails, no en formularios.

### F1 · RIA
- **Canal:** https://partners.riamoneytransfer.com/signup · partners@riamoneytransfer.com · +1 (800) 743-7426.
- **Enfoque:** red de cash pickup enorme en PH; CPA $1–5 + rev-share opcional a volumen.
- **Envío:** formulario con datos §0; si silencio, email corto (adaptar plantilla de follow-up §0 como primer contacto, con `[VIDEO_URL]`).

### F2 · PAYSEND
- **Canal:** https://partners.paysend.com/register · partnership@paysend.com. Aprobación 3–5 días.
- **Enfoque:** fees planos baratos, fuerte en card-to-card; CPA $1–10 según GEO. Payout mínimo $100.
- **Envío:** formulario con datos §0; email de refuerzo con `[VIDEO_URL]` si no responden.

### F3 · XE MONEY TRANSFER
- **Canal:** https://partners.xe.com/en/referral-program · partners@xe.com.
- **Enfoque:** marca de referencia en tipos de cambio; CPA $2–6 o rev-share a volumen. Su audiencia preferente es CA/AU/UK/US — declarar el foco EUR honestamente.
- **Envío:** formulario + email con `[VIDEO_URL]`.

### F4 · MONEYTRANS
- **Canal:** https://moneytrans.com/en/affiliate-program · affiliates@moneytrans.com.
- **Enfoque:** especialista europeo en remesas (presencia física en España) — encaje geográfico directo con nuestra audiencia. CPA $0.50–3.
- **Envío:** formulario + email con `[VIDEO_URL]`.

---

## §4 · Checklist de seguimiento

*(Movido desde `SolicitarAfiliados.md` — esta tabla es ahora la única fuente de estado.)*

**Estados:** ⬜ Pendiente · 🟡 Solicitud enviada · 🟢 Aprobado · 🔴 Rechazado / No viable

| Proveedor | Grupo | Fecha solicitud | Estado | URL obtenida | Fecha pegada en código | Notas |
|---|---|---|---|---|---|---|
| Wise | A | | ⬜ Pendiente | | | Partnerize |
| Western Union | A | | ⬜ Pendiente | | | Partnerize |
| CurrencyFair | A | | ⬜ Pendiente | | | Partnerize · CPA a negociar |
| Remitly | B | | ⬜ Pendiente | | | FlexOffers |
| Instarem | B | | ⬜ Pendiente | | | FlexOffers (fallback Partnerize) |
| TransferGo | C | | ⬜ Pendiente | | | FinanceAds |
| TorFX | D | | ⬜ Pendiente | | | Broker · esperar vídeo |
| Currencies Direct | D | | ⬜ Pendiente | | | Broker · esperar vídeo |
| OFX | D | | ⬜ Pendiente | | | Broker · esperar vídeo |
| WorldRemit | E | | ⬜ Pendiente | | | Awin |
| Xoom | E | | ⬜ Pendiente | | | Awin / PayPal |
| MoneyGram | E | | ⬜ Pendiente | | | CJ · vocabulario restringido |
| Ria | F | | ⬜ Pendiente | | | Directo |
| Paysend | F | | ⬜ Pendiente | | | Directo |
| XE Money Transfer | F | | ⬜ Pendiente | | | Directo |
| Moneytrans | F | | ⬜ Pendiente | | | Directo |
| Small World / Sigue | — | 🔴 N/A | ❌ Ceased 2026 | N/A | N/A | No integrar |
| Revolut | — | 🔴 N/A | ❌ No viable | N/A | N/A | Sin programa comercial |

### Vídeo demo (tarea aparte)

| Asset | Estado | URL |
|---|---|---|
| Vídeo genérico 60s (HyperFrames, spec §2) | 🟡 Producido 2026-07-14 (`videos/sulitsend-demo/renders/`, 52s, 1080p, silente) — **pendiente humano: subir a YouTube unlisted** y poner la URL aquí | `[VIDEO_URL]` |

Producción (2026-07-14): proyecto HyperFrames en `videos/sulitsend-demo/` (capture de localhost + STORYBOARD/DESIGN/SCRIPT + 6 sub-composiciones). Las 5 tomas del guion §2 están cubiertas (home €500 → podio/best deal → detalle Wise con gráfica → /how-we-make-money con highlight → cierre logo+URL). Sin audio (spec: sin voz; añadir BGM en YouTube si se quiere). Regenerar: `cd videos/sulitsend-demo && npx hyperframes render` (screenshots: `web/scripts/demo-shots.mjs` con el dev server arrancado).
