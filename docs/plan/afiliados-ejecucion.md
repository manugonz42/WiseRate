# Afiliados — Plan de ejecución (paso a paso, por proveedor)

## Dependencies
- [`SolicitarAfiliados.md`](../../SolicitarAfiliados.md) (raíz) — investigación por proveedor: comisiones, redes, contactos. Este doc no la repite; la ejecuta.
- Web en producción: https://app.sulitsend.com (live 2026-07-14) — "the live site is the credential".
- ✅ Vídeo demo HyperFrames (§2) — producido 2026-07-14, publicado en YouTube 2026-07-22: **https://youtu.be/O1nwx7N_jh0**. Ya sustituido en todas las plantillas de este doc.
- Email de contacto real `hello@sulitsend.com` — activo (Cloudflare Email Routing) y en `CONTACT_EMAIL` desde 2026-07-15; falta redeploy de prod para que se vea en las páginas públicas.
- ✅ Email **saliente** desde @sulitsend.com operativo desde 2026-07-22 (Brevo SMTP + Gmail "Enviar como"). Ya no bloquea el grupo D, C2 ni los follow-ups.

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

### Email saliente desde el dominio (Gmail "Send mail as" + Brevo SMTP)

**Direcciones activas (recepción — Cloudflare Email Routing):**

| Dirección | Uso | Reenvía a |
|---|---|---|
| `hello@sulitsend.com` | Contacto público del sitio (`CONTACT_EMAIL`) | inbox compartido |
| `manuel.gonzalez@sulitsend.com` | Outreach 1:1 (remitente con nombre → mejor tasa de respuesta) | Gmail personal (Manuel) |
| `madelyn.eglesia@sulitsend.com` | Outreach 1:1 (segunda persona del equipo) | Gmail personal (Madelyn) |
| `partnerships@sulitsend.com` | Formularios/programas que piden dirección de "área" | inbox compartido |

Las cuatro **reciben** ya (2026-07-15). Las direcciones destino concretas de reenvío no se documentan aquí (repo público). Para **enviar** desde ellas sin pagar Google Workspace: **Gmail "Send mail as" + SMTP gratuito de Brevo** (300 emails/día) manteniendo bandeja única en Gmail. La autenticación DNS (SPF/DKIM/DMARC) es **a nivel de dominio**, se hace **una sola vez** y sirve para las cuatro direcciones.

**DNS configurado (2026-07-21, vía Cloudflare API + Brevo):**
- ✅ `_dmarc.sulitsend.com` TXT = `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` (monitor, no rechaza; rua a Brevo para reportes de entregabilidad).
- ✅ SPF: `v=spf1 include:_spf.mx.cloudflare.net include:spf.brevo.com ~all` (Cloudflare + Brevo).
- ✅ DKIM: `brevo1._domainkey` → `b1.sulitsend-com.dkim.brevo.com` y `brevo2._domainkey` → `b2.sulitsend-com.dkim.brevo.com` (verificación en curso en Brevo).
- ✅ Brevo: dominio autenticado, SMTP generado (`smtp-relay.brevo.com:587`), enviando desde @sulitsend.com.

**Estado actual (2026-07-22):**
1. ✅ **Brevo:** Cuenta activa, dominio `sulitsend.com` autenticado, SMTP configurado. Los emails ya salen desde @sulitsend.com.
2. ✅ **DNS:** SPF + DKIM + DMARC verificados en vivo vía DoH el 2026-07-22 (las dos claves DKIM resuelven hasta la clave pública de Brevo). La autenticación **no** es el problema.
3. ⚠️ **Siguen llegando a Promociones.** Promociones ≠ spam: con SPF/DKIM/DMARC en PASS, la pestaña la decide el **contenido + la infraestructura**, no la autenticación. Causas por orden de peso:
   - **Firma HTML con 4 imágenes** (GIF animado 96×96 + wordmark + 2 iconos sociales), colores de marca, tabla y 4 enlaces → patrón de newsletter. Usar `firma-outreach.html` (solo texto, 1 enlace) para el primer contacto 1:1; dejar la firma completa para hilos ya iniciados.
   - **Tracking de Brevo:** el click-tracking reescribe los enlaces a un dominio de Brevo y el open-tracking mete un pixel 1×1. Desactivar ambos en Brevo → Transactional → Settings.
   - **Cabecera `List-Unsubscribe`** y/o footer "Sent with Brevo" del plan gratuito: huella de envío masivo en un email 1:1. Quitar lo que el plan permita.
   - **Dominio nuevo sin reputación:** se construye enviando pocos 1:1 en texto y consiguiendo respuestas. Que el destinatario arrastre el email a Principal o responda es la señal más fuerte.
   - Diagnóstico sobre un email real: Gmail → ⋮ → "Mostrar original" (comprobar `dkim=pass header.d=sulitsend.com`, presencia de `List-Unsubscribe` y si los enlaces están reescritos).
4. ✅ **Gmail "Send mail as":** configurado y funcionando (2026-07-22). Ya se envía desde las direcciones @sulitsend.com vía SMTP de Brevo, con bandeja única en Gmail.
5. ⏳ **Probar entregabilidad:** mail-tester.com — SPF, DKIM y DMARC deben salir en **PASS**. Pendiente, pero no bloquea el envío; sirve para atacar el tema de Promociones del punto 3.

**Nota:** Los emails salen desde Brevo, la bandeja de entrada en Gmail es única (via Email Routing), y desde entonces el plan usa `manuel.gonzalez@`/`madelyn.eglesia@` para outreach 1:1, `partnerships@` para formularios, nunca desde la Gmail personal.

### Descripción del sitio (EN — pegar en el campo "website description")

> SulitSend (app.sulitsend.com) is a money-transfer comparison site for people sending money from Europe to the Philippines. We compare live quotes — exchange rate, fees, delivery time and delivery methods — across providers for the EUR→PHP corridor, plus GBP/USD/CAD/AUD→PHP. Rankings are based purely on the amount the recipient gets; we publish a full affiliate disclosure at app.sulitsend.com/how-we-make-money.

### Categoría / tipo de sitio (campo "publisher type" / "site category")

**Somos comparison/review site, NO "comparison shopping service" (CSS).** CSS es un término con significado propio — comparadores de producto físico con feed de catálogo, ligados a Google Shopping/retail. Marcarlo manda la solicitud al cubo equivocado (revisión de feeds, expectativa de catálogo). Lo nuestro es comparación de **servicios financieros en vivo** + contenido editorial.

| Red / formulario | Qué marcar |
|---|---|
| Awin | Comparison / Price comparison → subcategoría Financial services |
| Impact, CJ, Partnerize | Content / Review → Comparison site |
| Formulario propio del proveedor | "Comparison & review site" (o Content/Review si no hay comparison) |

Regla: si el formulario ofrece **Comparison**, marcarlo — es la categoría más fuerte en remesas (tráfico de alta intención). Si solo ofrece "Comparison shopping/CSS" frente a "Content/Review", coger **Content/Review**. Nunca marcar PPC, coupon/voucher, cashback ni incentivized aunque el formulario los ofrezca (ver §0 → método de promoción).

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
> Here is a 60-second walkthrough of the product: https://youtu.be/O1nwx7N_jh0
>
> Best regards,
> [NOMBRE]

### Al aprobar cualquier solicitud (procedimiento común)

1. Copiar la URL/link de tracking desde el panel de la red.
2. Pegarla en `web/lib/data/providers.ts` → campo `affiliateURL` del proveedor (brokers: `web/lib/brokers.ts` → campo `url`).
3. Probar en local que el link trackea (aterriza en el proveedor con tu ID visible en la URL/cookie) **antes** de deployar.
4. **Sub-ID (para T37, referidos):** verificar el parámetro de sub-tracking de la red (tabla en [`SolicitarAfiliados.md` § Tracking por usuario](../../SolicitarAfiliados.md)) y anotar el nombre exacto → irá al campo `subIdParam` de `providers.ts` cuando T37 se ejecute. En redes es self-serve (probar que el informe de clicks lo devuelve). En **directos/brokers** (grupos D y F), preguntar al account manager en esta conversación post-aprobación, formulado como analítica: *"Can we append a click-reference parameter (e.g. `?ref=<id>`) to our tracking link and see it back in conversion/client reports, for internal analytics?"* — ⚠️ **nunca** mencionar el sistema de recompensas aquí (gate del §0: eso se pregunta aparte y solo con comisiones ya cobradas). Si la red tiene evento "lead" (registro sin transferencia), pedir que lo activen en el reporting.
5. Deploy + marcar el [checklist §4](#4--checklist-de-seguimiento).
6. **Primer link vivo** → flip de ambos proyectos Vercel a Pro (Hobby prohíbe uso comercial — README checklist).
7. Si el deal incluye bonus de referido para el usuario → poblar también `referralPromo` en `providers.ts` (T22).

---

## §1 · Orden de ejecución

Agrupado por red: **una cuenta desbloquea varios programas**. Ejecutar en orden; dentro de cada grupo, en el orden listado. No esperar la aprobación de un grupo para lanzar el siguiente.

| Paso | Grupo | Programas | Canal |
|---|---|---|---|
| 0 | Prerequisitos | — | — |
| 1 | **A — Partnerize** | Wise → Western Union → Instarem* | 1 cuenta Partnerize |
| 2 | **B — FlexOffers** | Remitly → Instarem* → Sendwave | 1 cuenta FlexOffers |
| 3 | **C — Directos** | TransferGo (FinanceAds) → Taptap Send (acuerdo directo) | Formulario propio / email |
| 4 | **D — Brokers** | TorFX → Currencies Direct → OFX | Email/formulario con pitch (vídeo ✅ listo desde 2026-07-22) |
| 5 | **E — Redes secundarias** | WorldRemit + Xoom (Awin) → MoneyGram (CJ) | 1 cuenta Awin + 1 cuenta CJ |
| 6 | **F — Baja prioridad** | Ria → Paysend → XE → Moneytrans → Panda Remit | Formulario/email directo (solo cuando A–E estén en marcha) |

⚠️ **CurrencyFair salió del grupo A (2026-07-22):** su campaña **ya no existe en Partnerize** — comprobado con cuenta creada por su propio link (`Join Campaigns` muestra Wise/WU pero ni "currency" ni "fair" devuelven nada, y el registro no tiene campo de partner ID). El programa vive en **impact.com**; ficha A3 actualizada. El link de Partnerize y el ID `1011l6561` de su web están obsoletos.

\* **Instarem — decisión:** solicitar vía **FlexOffers** (mejor CPA: $12/transacción + $2.40/sign-up vs multi-geo de Partnerize; misma cuenta que Remitly). Partnerize queda de fallback si FlexOffers rechaza.

Descartados (solo constan en la guía de referencia): Small World/Sigue (ceased 2026), Revolut (sin programa comercial viable), WireBarley (solo refer-a-friend de consumidor, sin programa de afiliados — investigado 2026-07-19).

### Paso 0 — Prerequisitos

- [x] Email de contacto decidido: growglow.app@gmail.com (§0).
- [x] Crear `hello@sulitsend.com` (Cloudflare Email Routing → growglow.app@gmail.com, activo) y ponerlo en `CONTACT_EMAIL` (`web/lib/site.ts`) — hecho 2026-07-15 (commit a7f6cd6). ⚠️ **Pendiente deploy a prod**: las páginas públicas siguen mostrando "TODO(human)" hasta redeploy de `sulitsend-web` (`vercel --prod` desde la raíz del repo — requiere aprobación explícita del usuario).
- [x] Verificado 2026-07-15 (DoH + curl con `--resolve` a IPs de Vercel, saltando el bloqueo FortiGuard local): DNS global correcto, `app.sulitsend.com/home` 200, `/how-we-make-money` 200 con el contenido de disclosure, `sulitsend.com` → `/en` 200. (Chequeo visual desde móvil/otra red sigue siendo recomendable antes de enviar solicitudes.)
- [x] Producción del vídeo demo (§2) — hecho 2026-07-14, dos variantes (ver §4); **subido a YouTube 2026-07-22**: https://youtu.be/O1nwx7N_jh0
- [x] Direcciones de dominio para outreach creadas 2026-07-15 (recepción vía Email Routing → growglow.app@gmail.com): `manuel.gonzalez@`, `madelyn.eglesia@`, `partnerships@sulitsend.com`. DMARC (`p=none`, monitor) añadido a la zona.
- [x] Email **saliente** desde el dominio — completado 2026-07-21:
  - [x] Brevo: cuenta activa, dominio autenticado, SMTP generado.
  - [x] DNS: SPF + DKIM + DMARC configurados (vía Cloudflare API, propagar en 5–10 min).
  - [x] Gmail "Enviar como": configurado y **funcionando** (2026-07-22). El envío desde las direcciones @sulitsend.com ya no bloquea nada — grupo D, C2 y follow-ups desbloqueados.

---

## §2 · Vídeo demo (spec — producción en tarea aparte con HyperFrames)

- **Formato:** 45–60 s, inglés, sin voz (texto sobre pantalla), 1080p horizontal, sobre la web real en producción.
- **Guion de tomas:**
  1. Home con comparación EUR→PHP en vivo (monto de ejemplo €500) — "Live quotes from real providers".
  2. Podio / best deal — "Ranked by what the recipient actually gets".
  3. Detalle de proveedor (gráfica de tendencia del tipo de cambio) — "Rate history and provider reviews".
  4. Página `/how-we-make-money` — "Fully transparent: commissions never affect rate or ranking". *(La transparencia es lo que más pesa para un reviewer de programa de afiliados.)*
  5. Cierre: logo SulitSend + `app.sulitsend.com`.
- **Hosting:** YouTube → **https://youtu.be/O1nwx7N_jh0** (publicado 2026-07-22; sustituido ya en todas las plantillas de emails de este doc).
- **Dónde se usa:** siempre en emails directos y pitches a brokers (grupo D); en formularios de red **no hay campo de adjunto** — si el campo de descripción lo permite, añadir al final: `Product walkthrough (60s): https://youtu.be/O1nwx7N_jh0`.
- ✅ Publicado 2026-07-22 — ya no bloquea nada. El grupo D (brokers), que sí lo esperaba, queda desbloqueado.

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

- **Vídeo:** no hay campo; añadir al final de la descripción: `Product walkthrough (60s): https://youtu.be/O1nwx7N_jh0`.
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

### A3 · CURRENCYFAIR — **vía Impact, no Partnerize** *(ficha 2026-07-14; canal corregido 2026-07-22)*

- **Canal:** https://member.impactradius.com/campaign-mediapartner-signup/Currencyfair.brand?type=dm (signup de media partner directo a la marca). Revisión en ~3 días hábiles.
  - ⚠️ **No usar el link de Partnerize** que publica https://www.currencyfair.com/affiliate-program (`signup.partnerize.com/signup/en/visualsoft` + "partner ID `1011l6561`"): obsoleto, esa campaña ya no está en el directorio de Partnerize (verificado 2026-07-22 con cuenta propia). La vía Impact es la que la FAQ técnica lista como alternativa y la que respalda el caso de estudio de impact.com.
  - **Misma cuenta Impact** que la alternativa de TransferGo (C1) y Panda Remit (F5) — crearla aquí y reutilizarla.
  - **Sub-ID (T37):** `subId1..subId3` (Impact), **no** `clickref`.
- **Programa (cifras reales — leídas en los Terms de Impact, 2026-07-22):**

| Concepto | Valor |
|---|---|
| Registro (cuenta creada) | **€0** — el lead no se paga |
| Transferencia, corredor **PHP** (payout groups 3 y 4, personal y business) | **€10 por orden** |
| Business genérico (group 8) | €100 · resto (`All Other`) €10 |
| Umbral de cobro | ≥ **€1.000** personal / €2.000 business — **acumulativo** (§2.2: si la primera transferencia no lo alcanza, monitorizan la cuenta y pagan cuando el cliente lo cruza) |
| Atribución | 180 días desde el click *y* desde la acción padre (registro); impresiones no cuentan |
| Credit policy | Registro gana, luego cascada a last click |
| Cobro | lock a +5 días del fin de mes en que se trackea, pago a +19 días del lock → ~día 25 del mes siguiente |
| Reversal | hasta **100%**, a discreción del anunciante |
| Cambio de términos | con **1 día** de aviso (pueden bajar el payout) |

  ⚠️ El "CPA competitivo a negociar" de la investigación inicial era optimista: para PHP el payout está **fijado en €10** en la IO. Rev-share solo si lo ofrecen aparte. Implicación económica: un remitente típico (€250–500/envío) cobra a los 2–4 envíos, no al primero; un usuario que prueba una vez y no repite **no paga nada**.
- **Prohibiciones relevantes de los T&C:** §3.1(a) no crear cuentas ni transferir uno mismo (ojo con el canal comunidad: nada de cuentas de familiares para generar comisión); §3.1(b) no brand bidding en SEM sin permiso escrito; §3.1(c) no dar a entender que somos CurrencyFair. El sistema de recompensas del §0 sigue gateado — preguntarlo por escrito al account manager **solo** con comisiones ya cobradas.
- **Enfoque:** CurrencyFair es nuestro único proveedor **tier A** de cotización directa (T22) — su quote sale en el comparador con el monto exacto; eso es tráfico de máxima intención hacia ellos. ⚠️ No confundir con su refer-a-friend de consumidores (€50 — es bonus de usuario, no CPA de afiliado).
- **Qué enviar:** mismos campos que A1; en Description añadir: *"CurrencyFair is one of the few providers our engine quotes directly at the exact send amount, so your listing shows live, precise pricing — the highest-intent placement on the site."*
- **Vídeo:** link en descripción/follow-up.
- **Pasos:** 1) crear cuenta Impact (o usar la existente) y aplicar a la campaña Currencyfair → 2) aprobación ~3 días → 3) **aceptar la IO** (no es exclusiva ni ata: ellos mismos pueden cambiarla con 1 día de aviso, y sin aprobación no hay account manager con quien negociar) → 4) enviar el [email post-aprobación](#email-post-aprobación--aclaraciones-de-la-io--apertura-de-negociación-redactado-2026-07-22) con las 3 aclaraciones pendientes → 5) procedimiento común §0.
- **Follow-up:** +7 días hábiles vía el panel Impact (no hay email público de partnerships; solo mencionan "dedicated Affiliate Manager" post-aprobación). Segunda vía: formulario de contacto de currencyfair.com pidiendo derivación a partnerships, con el email pitch de abajo.
- **Restricciones:** umbral €1.000 por cliente para cobrar; permiten banners, text links, vídeo embebido y API para afiliados aprobados.
- **❓ Ambigüedades de la IO — sin resolver hasta preguntar (2026-07-22):**
  1. **¿El umbral de €1.000 debe alcanzarse dentro de la ventana de 180 días?** El §2.2 dice que monitorizan la cuenta "hasta" que se cruce, sin plazo; la ventana técnica de Impact podría cortarlo antes. Si se corta, un cliente que se queda en €700 nunca paga. **Es la variable que decide si el programa es rentable en nuestro corredor.**
  2. **¿"€10 per order" es único por cliente o por transferencia?** Los T&C hablan de "*an* affiliate referral fee" (singular) → probablemente único, pero si fuera por transferencia la economía cambia por completo.
  3. **¿La ventana del Transfer cuenta desde el click o desde el registro?** Como la credit policy es "Winner of Registration then cascades to Last Click" y admite atribución "from parent actions within 180 days", la lectura razonable es **desde el registro** — lo que encadena ~180 (click→registro) + ~180 (registro→transfer) ≈ casi un año de cobertura. Confirmar.

#### Email pitch CurrencyFair (redactado 2026-07-16 — enfoque comunidad)

Para el formulario de contacto de currencyfair.com/affiliate-program (pedir que lo deriven a partnerships), como acompañamiento de la solicitud Partnerize, o como follow-up. Enviar desde `manuel.gonzalez@sulitsend.com` (envío saliente ✅ operativo desde 2026-07-22). El punto 2 del crecimiento está redactado deliberadamente como *app referral* (ventajas premium por invitar gente a la app), nunca como recompensa por registrarse en el proveedor — fuera del gate de incentivized traffic del §0.

> **Subject:** Partnership — SulitSend, built for the Filipino community in Europe (CurrencyFair ranks #1 in our comparisons)
>
> Hi CurrencyFair team,
>
> I'm Manuel González, founder of SulitSend (app.sulitsend.com). I'm part of the Filipino community in Spain, and SulitSend was born from something I kept seeing around me: most people send money home the way they always have, without ever checking if there's a better option — when they could be saving real money on every single transfer just by comparing. SulitSend does that comparison for them, for the Europe→Philippines corridor, ranking providers purely by how much the recipient actually gets.
>
> Why I'm writing to you specifically: based on live pricing through your API and official published information, CurrencyFair is consistently the best-rate provider we've found for our corridor. That means you're likely to become the most recommended — and most used — provider on our app, and we'd like to reach a partnership or affiliate agreement that reflects that.
>
> This is a young project, but it's growing on an already professional foundation — the web app is live in production — and our plan is to reinvest the earnings into expanding to native Android and iPhone apps.
>
> How we're growing, in this order:
>
> 1. **Direct recommendation within the Filipino community in Spain** — I have a large network of personal contacts and an established client base here; word of mouth inside the community is our main channel.
> 2. **A referral scheme inside the app** — users unlock premium features for free (rate alerts, promo finder, personalised recommendations, direct support) by sharing the app with friends and family.
> 3. **Reinvestment into organic marketing and SEO** as revenue comes in.
>
> Feel free to try the app at app.sulitsend.com — we recommend opening it from a phone, as the design is mobile-first — and we'd genuinely welcome any feedback or recommendations to improve it.
>
> Product walkthrough (60s): https://youtu.be/O1nwx7N_jh0
>
> I'd love to talk about how we could work together. Happy to share anything else you need.
>
> Best regards,
> Manuel González
> Founder, SulitSend
> app.sulitsend.com · manuel.gonzalez@sulitsend.com

#### Email post-aprobación — aclaraciones de la IO + apertura de negociación *(redactado 2026-07-22)*

Enviar **al account manager asignado**, no antes de la aprobación (sin aprobación no hay interlocutor). Las tres preguntas del primer bloque son las que **la IO no contesta** y que determinan si el programa es rentable en nuestro corredor; el segundo bloque abre la negociación sin exigir nada.

⚠️ **Gate del §0:** este email **no** menciona el sistema de recompensas a recomendadores. Eso es una conversación separada, y solo con comisiones ya cobradas.

> **Subject:** SulitSend — tracking setup + two questions before we send traffic
>
> Hi [NAME],
>
> I'm Manuel González, founder of SulitSend, a comparison app for the Europe→Philippines remittance corridor that ranks providers purely by how much the recipient receives.
>
> Across live pricing and your published rates, CurrencyFair consistently comes out best for this corridor, which makes you our top recommendation. I've just been approved through your Impact campaign — before I start directing users your way, I want to be sure the attribution is set up correctly, so every signup and first transfer is properly tracked rather than reaching you untracked.
>
> Three things I couldn't resolve from the insertion order:
>
> 1. Does the €1,000 Minimum Transfer Threshold have to be reached **within** the 180-day attribution window, or does the account monitoring in clause 2.2 continue beyond it until the customer crosses it?
> 2. Is the €10 payout a **one-off per referred customer**, or paid per qualifying transfer within the window?
> 3. For the Transfer action, is the 180 days counted from the original click or from the registration date?
>
> Worth flagging for later: our users send €200–500 **monthly** — a different profile from CurrencyFair's classic FX customer, and I suspect the €1,000 threshold is calibrated for the latter. A customer we refer likely moves €3,000–6,000 a year, but takes several transfers to cross €1,000. Once I have volume data, I'd like to revisit whether a lower threshold for this corridor, or a revenue share instead of a one-off CPA, works better for both sides.
>
> The app is live in production and about to start its push through the Filipino community in Spain, with native iOS/Android in development.
>
> Happy to do a quick call this week if that's easier.
>
> Try it (mobile-first): https://app.sulitsend.com
> Walkthrough: https://youtu.be/O1nwx7N_jh0
>
> Best,
> Manuel González
> Founder, SulitSend
> app.sulitsend.com · manuel.gonzalez@sulitsend.com

**Notas de redacción (2026-07-22):**
- **No menciona el referral scheme.** El pitch largo de arriba sí lo hace, pero redactado con cuidado (*"users unlock premium features by sharing the app"* — beneficio por invitar a la app, nunca por registrarse en el proveedor). En un email corto no cabe ese matiz y "in-app referral scheme" a secas se lee como *incentivized traffic* → gate del §0. Se omite.
- **No pide "point me to your affiliate program"**: ya estamos dentro de la campaña de Impact; preguntarlo delataría descoordinación. Se referencia la aprobación.
- **Expectativa realista:** las tres aclaraciones las contestan; la mejora de condiciones lo normal es que la aplacen a "cuando tengáis volumen" — de ahí que se plantee como conversación futura con datos, en vez de pedirla ahora sin leverage. Anotar las respuestas en la tabla de payouts de arriba (sustituyen a lo inferido).

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
| Publisher type | Comparison/review site — §0 (nunca CSS) |
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

### B3 · SENDWAVE *(nueva ficha 2026-07-19 — investigación T38/T39)*

- **Canal:** desde la misma cuenta FlexOffers: https://www.flexoffers.com/affiliate-programs/sendwave-affiliate-program/. Sin email público de partnerships — el follow-up va por ticket FlexOffers.
- **Enfoque:** partner **oficial** de GCash (nota de prensa Mynt 2025) y fiabilidad confirmada por usuarios reales de la comunidad. Con T39 ejecutada, su quote sale directo en el comparador con el monto exacto (mismo argumento de máxima intención que CurrencyFair A3). Es del grupo Zepz (WorldRemit) — marca y programa separados de E1, sin conflicto.
- **Qué enviar:** mismos campos que B1; en Description añadir: *"Sendwave is quoted directly by our engine at the exact send amount for EUR/GBP/USD/CAD→PHP, and our audience overlaps exactly with Sendwave's GCash-first Filipino remitters."*
- **Vídeo:** link en descripción/follow-up.
- **Pasos:** 1) aplicar desde la cuenta FlexOffers (creada en B1) → 2) aprobación → 3) procedimiento común §0. `subIdParam` esperado `fobs` (estándar FlexOffers) — verificar en la aprobación.
- **Restricciones:** las estándar FlexOffers (no PPC, no incentivizado, no coupons) — mismo gate de rewards del §0.

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
| Publisher type | Comparison/review site — §0 (nunca CSS) |
| Description | Descripción EN §0 + *"Our audience is migrant workers in Europe sending money home — TransferGo's core demographic."* |
| Promotion | Método §0 |

- **Vídeo:** link en descripción/follow-up.
- **Pasos:** 1) cuenta FinanceAds → 2) aplicar a TransferGo → 3) aprobación → 4) procedimiento común §0.
- **Follow-up:** +7 días hábiles vía FinanceAds; segunda vía: aplicar por Impact Radius.
- **Restricciones:** tracking real-time con deep linking disponible (aprovechar: deep-link al flujo EUR→PHP).

### C2 · TAPTAP SEND *(nueva ficha 2026-07-19 — investigación T38/T39)*

- **Canal:** programa de afiliados **directo, sin red** — existe formalmente ([Affiliate Partner Terms](https://www.taptapsend.com/terms/affiliate-partner-terms): se firma un "Affiliate Partner Scope of Work Agreement" individual). **No hay email público de partnerships**: entrar por el [formulario de contacto](https://www.taptapsend.com/contact) y por `support@taptapsend.com` pidiendo derivación al equipo de partnerships (el formato interno de email es `nombre.apellido@taptapsend.com` si algún contacto directo aparece por LinkedIn).
- **Enfoque:** es el único proveedor nuevo que cubre **los 5 corredores** de la app (incl. AUD→PHP), sin fee hacia PH, Trustpilot 4.7/5 (~36.000 reseñas), y con T38 su quote sale directo del propio feed de Taptap Send — el pitch es idéntico al de CurrencyFair A3: máxima intención, precio en vivo exacto.
- **Qué enviar:** adaptar el email pitch de A3 (comunidad filipina + comparador que ya los rankea). Enviar desde `manuel.gonzalez@sulitsend.com` (envío saliente ✅ operativo desde 2026-07-22).
- **Vídeo:** sí, en el email (`https://youtu.be/O1nwx7N_jh0`).
- **Pasos:** 1) ejecutar T38 primero (que el reviewer se vea ya listado en producción) → 2) formulario de contacto + email → 3) negociar términos del Scope of Work (CPA no publicado — que propongan ellos) → 4) procedimiento común §0. **Sub-ID:** programa directo — preguntar el parámetro de click-reference al manager post-aprobación (§0 paso 4), nunca en el primer contacto.
- **Follow-up:** +7 días hábiles (plantilla §0) al mismo canal.
- **Restricciones:** las que fije su Scope of Work; mientras no haya acuerdo, `affiliateURL: null` y el CTA cae a taptapsend.com (convención `providers.ts`).

---

## §3 · Fichas — Grupo D · Brokers (rev-share lifetime — pitch a persona)

> A los brokers los revisa un partnership manager humano: aquí el email y el vídeo importan más que el formulario. Confirmar cobertura EUR→PHP **en el propio mensaje** (condición del README checklist). Estos ingresos son recurrentes (el único revenue por-transacción sin licencia de pagos — ROADMAP).
>
> **Sub-ID:** no preguntarlo en el email inicial (ruido técnico + roza el gate de rewards del §0). Se pregunta al manager **tras la aprobación** — paso 4 del procedimiento común §0. Los introducer suelen reportar rev-share por cliente identificado, así que puede que ni haga falta parámetro.

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
> Here's a 60-second walkthrough of the product: https://youtu.be/O1nwx7N_jh0
>
> Best regards,
> [NOMBRE] — SulitSend
> [EMAIL] · app.sulitsend.com

- **Vídeo:** **sí**, enlazado en el email (listo: https://youtu.be/O1nwx7N_jh0).
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
- **Qué enviar (campos Awin):** URL, categoría Finance, descripción EN §0, método de promoción §0. Si se usa el email directo, adaptar el email de D1 quitando la parte de brokers y añadiendo `https://youtu.be/O1nwx7N_jh0`.
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
>
> **Sub-ID:** los cuatro son programas directos (sin red) — como en el grupo D, preguntar el parámetro de click-reference al manager **tras la aprobación** (paso 4 del procedimiento común §0), nunca en la solicitud inicial.

### F1 · RIA
- **Canal:** https://partners.riamoneytransfer.com/signup · partners@riamoneytransfer.com · +1 (800) 743-7426.
- **Enfoque:** red de cash pickup enorme en PH; CPA $1–5 + rev-share opcional a volumen.
- **Envío:** formulario con datos §0; si silencio, email corto (adaptar plantilla de follow-up §0 como primer contacto, con `https://youtu.be/O1nwx7N_jh0`).

### F2 · PAYSEND
- **Canal:** https://partners.paysend.com/register · partnership@paysend.com. Aprobación 3–5 días.
- **Enfoque:** fees planos baratos, fuerte en card-to-card; CPA $1–10 según GEO. Payout mínimo $100.
- **Envío:** formulario con datos §0; email de refuerzo con `https://youtu.be/O1nwx7N_jh0` si no responden.

### F3 · XE MONEY TRANSFER
- **Canal:** https://partners.xe.com/en/referral-program · partners@xe.com.
- **Enfoque:** marca de referencia en tipos de cambio; CPA $2–6 o rev-share a volumen. Su audiencia preferente es CA/AU/UK/US — declarar el foco EUR honestamente.
- **Envío:** formulario + email con `https://youtu.be/O1nwx7N_jh0`.

### F4 · MONEYTRANS
- **Canal:** https://moneytrans.com/en/affiliate-program · affiliates@moneytrans.com.
- **Enfoque:** especialista europeo en remesas (presencia física en España) — encaje geográfico directo con nuestra audiencia. CPA $0.50–3.
- **Envío:** formulario + email con `https://youtu.be/O1nwx7N_jh0`.

### F5 · PANDA REMIT *(nueva ficha 2026-07-19)*
- **Canal:** Impact, vía https://www.pandaremit.com/en/partner · contacto directo **liyg@pandaremit.com** (lo publican ellos para dudas o si ya tienes cuenta Impact). $20/primera transferencia, cookie 1 año.
- **Enfoque:** cubre AU→PH entre otros. ⚠️ Aún no aparece en el comparador (ni directo ni vía Wise) — solicitar solo si se decide integrarlo (sin tarea asignada); un link sin fila donde colgarlo no monetiza.
- **Envío:** cuenta Impact + email a liyg@pandaremit.com con la descripción §0 y `https://youtu.be/O1nwx7N_jh0`.

---

## §4 · Checklist de seguimiento

*(Movido desde `SolicitarAfiliados.md` — esta tabla es ahora la única fuente de estado.)*

**Estados:** ⬜ Pendiente · 🟡 Solicitud enviada · 🟢 Aprobado · 🔴 Rechazado / No viable

| Proveedor | Grupo | Fecha solicitud | Estado | URL obtenida | Fecha pegada en código | Notas |
|---|---|---|---|---|---|---|
| Wise | A | 2026-07-22 | 🟡 Solicitud enviada | | | Partnerize · aprobación esperada 2–5 días · link se coge en Wise app → "Earn" |
| Western Union | A | | ⬜ Pendiente | | | Partnerize |
| CurrencyFair | A | 2026-07-22 | 🟡 Solicitud enviada | | | **Impact** (no Partnerize — corregido 2026-07-22) · CPA **€10** fijo corredor PHP, umbral €1.000 acumulados · sub-ID `subId1` |
| Remitly | B | | ⬜ Pendiente | | | FlexOffers |
| Instarem | B | | ⬜ Pendiente | | | FlexOffers (fallback Partnerize) |
| TransferGo | C | | ⬜ Pendiente | | | FinanceAds |
| Sendwave | B | | ⬜ Pendiente | | | FlexOffers (misma cuenta que Remitly) · quote directo: T39 |
| Taptap Send | C | | ⬜ Pendiente | | | Directo (form contact + support@taptapsend.com → partnerships) · T38 ✅ ejecutada · email saliente ✅ — listo para enviar |
| TorFX | D | | ⬜ Pendiente | | | Broker · desbloqueado (vídeo listo) · confirmar EUR→PHP en el email |
| Currencies Direct | D | | ⬜ Pendiente | | | Broker · desbloqueado (vídeo listo) |
| OFX | D | | ⬜ Pendiente | | | Broker · desbloqueado (vídeo listo) · rev-share 24 meses |
| WorldRemit | E | | ⬜ Pendiente | | | Awin |
| Xoom | E | | ⬜ Pendiente | | | Awin / PayPal |
| MoneyGram | E | | ⬜ Pendiente | | | CJ · vocabulario restringido |
| Ria | F | | ⬜ Pendiente | | | Directo |
| Paysend | F | | ⬜ Pendiente | | | Directo |
| XE Money Transfer | F | | ⬜ Pendiente | | | Directo |
| Moneytrans | F | | ⬜ Pendiente | | | Directo |
| Panda Remit | F | | ⬜ Pendiente | | | Impact · liyg@pandaremit.com · gateado: sin fila en el comparador aún |
| Small World / Sigue | — | 🔴 N/A | ❌ Ceased 2026 | N/A | N/A | No integrar |
| Revolut | — | 🔴 N/A | ❌ No viable | N/A | N/A | Sin programa comercial |
| WireBarley | — | 🔴 N/A | ❌ No viable | N/A | N/A | Solo refer-a-friend de consumidor (2026-07-19) |

### Vídeo demo (tarea aparte)

| Asset | Estado | URL |
|---|---|---|
| Vídeo demo 60s — **variante móvil** (HyperFrames, spec §2) | 🟢 Producido 2026-07-14 (`videos/sulitsend-demo-mobile/`, 52s, 1080p, silente) · **publicado en YouTube 2026-07-22** · es el vídeo **general** para todas las solicitudes de momento | **https://youtu.be/O1nwx7N_jh0** |

Producción (2026-07-14): proyecto HyperFrames en `videos/sulitsend-demo/` (capture de localhost + STORYBOARD/DESIGN/SCRIPT + 6 sub-composiciones). Las 5 tomas del guion §2 están cubiertas (home €500 → podio/best deal → detalle Wise con gráfica → /how-we-make-money con highlight → cierre logo+URL). Sin audio (spec: sin voz; añadir BGM en YouTube si se quiere). Regenerar: `cd videos/sulitsend-demo && npx hyperframes render` (screenshots: `web/scripts/demo-shots.mjs` con el dev server arrancado).

**Variante móvil** (2026-07-14, mismo guion): `videos/sulitsend-demo-mobile/` — la web móvil dentro de un mockup de teléfono con balanceo 3D suave, fondo tinta oscura en todos los beats (sin fondos claros). Screenshots móviles: `web/scripts/demo-shots-mobile.mjs`.

➡️ **Decisión 2026-07-22:** la variante **móvil** es la publicada y se usa como vídeo **general** en todas las solicitudes (encaja con el "mobile-first" que dicen los emails). La variante de escritorio (`videos/sulitsend-demo/`) queda producida pero sin publicar, por si más adelante interesa una específica para un pitch concreto.
