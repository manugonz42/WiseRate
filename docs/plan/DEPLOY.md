# Deploy runbook — web + landing

Two separate Vercel projects, one repo. Root domain is the landing marketing site; the app lives on a subdomain.

## Haz deploy (CLI — método vigente)

No hay git integration, así que los pushes **no** auto-despliegan. Se despliega a producción por CLI. Ambos proyectos tienen `rootDirectory` configurado en Vercel (`web` / `landing`), por lo que **hay que desplegar desde la raíz del repo** — desde `web/` o `landing/` falla con `…\web\web does not exist`.

Desde la raíz del repo (`WiseRate/`), primero comprueba que el árbol está limpio y en sync con `origin/main` (lo desplegado = working tree), luego por cada proyecto:

```bash
# En Git Bash (Windows) antepón MSYS_NO_PATHCONV=1 a los comandos vercel.

# 1) web  → app.sulitsend.com
vercel link --yes --project sulitsend-web
vercel deploy --prod --yes
rm -rf .vercel .env.local            # limpia el link temporal del root

# 2) landing → sulitsend.com (+ www)
vercel link --yes --project sulitsend-landing
vercel deploy --prod --yes
rm -rf .vercel .env.local
```

`vercel link` crea un `.vercel` temporal en la raíz; se borra al final (los links permanentes viven en `web/.vercel` y `landing/.vercel`). El deploy sube todo el repo y Vercel aplica `rootDirectory` para construir solo el subdir.

Verificar producción tras cada deploy:

```bash
vercel inspect <deploy-url>          # confirma readyState READY + Aliases (app.sulitsend.com / sulitsend.com)
curl -I https://app.sulitsend.com/api/health   # → 200
curl -I https://sulitsend.com/                 # → 200
```

Team: `grow-glow` (login `growglowapp-1267`). Si `vercel whoami` no devuelve el team, `vercel login` primero.

## Status (2026-07-16)

Todo ejecutado y en producción: Cloudflare DNS (3 records, DNS-only), ambos proyectos Vercel (team `grow-glow`), dominios verificados, env vars prod, www→apex 308, `rootDirectory`, deploys de producción en vivo con la última versión (T33 logomark). El bloqueo local de FortiGuard sobre `sulitsend.com` ya no aplica — los curls de verificación funcionan desde esta máquina.

Pendiente (opcional, no priorizado): **Git integration** para auto-deploy en push — instalar la **Vercel GitHub App** en el repo ([github.com/apps/vercel](https://github.com/apps/vercel) → Configure → `manugonz42/WiseRate`), luego `vercel git connect https://github.com/manugonz42/WiseRate.git --yes` en `web/` y `landing/`.

## 1. Vercel projects

| Project | Root directory | Domain | Framework preset |
|---|---|---|---|
| `sulitsend-web` | `web/` | `app.sulitsend.com` | Next.js |
| `sulitsend-landing` | `landing/` | `sulitsend.com` (+ `www.sulitsend.com` → redirect) | Next.js |

Import the repo twice in Vercel (once per project), setting each project's **Root Directory** in Project Settings → General. Both build with the default `npm install && npm run build`.

## 2. DNS records

Point these at Vercel per its dashboard instructions (exact values shown when you add each domain in Vercel → Project → Settings → Domains):

- `sulitsend.com` (apex) → A/ALIAS record to Vercel, for `sulitsend-landing`
- `www.sulitsend.com` → CNAME to Vercel, redirect to apex (configure in `sulitsend-landing`'s domain settings)
- `app.sulitsend.com` → CNAME to Vercel, for `sulitsend-web`

## 3. Environment variables

### `sulitsend-web` (Vercel → Settings → Environment Variables)

| Var | Required | Unset fallback |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Set to `https://app.sulitsend.com` | falls back to `https://app.sulitsend.com` in code, but set explicitly so it survives a future rename |
| `NEXT_PUBLIC_POSTHOG_KEY` | Set once PostHog account exists | analytics no-ops (console.info in dev, silent in prod) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Set to `https://eu.i.posthog.com` (EU data residency) | defaults to `https://eu.i.posthog.com` |
| `UPSTASH_REDIS_REST_URL` | Set once Upstash DB exists | falls back to in-memory Map cache (fine for one instance, resets per deploy) |
| `UPSTASH_REDIS_REST_TOKEN` | Set alongside the URL above | same fallback as above |

### `sulitsend-landing`

| Var | Required | Unset fallback |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Set to `https://sulitsend.com` | falls back to `https://sulitsend.com` in code |
| `NEXT_PUBLIC_APP_URL` | Set to `https://app.sulitsend.com/compare` | falls back to same value in code |
| `NEXT_PUBLIC_CORRIDOR_URL` | Set to `https://app.sulitsend.com/send/eur-to-php` | falls back to same value in code |

All three landing vars are redundant with their code fallbacks today (same domains) — set them anyway so a future domain change is a Vercel env edit, not a redeploy.

## 4. Hobby → Pro

Vercel's Hobby tier forbids commercial use. **Flip both projects to Pro before any affiliate link goes live** (i.e. before the human checklist's affiliate-URL-pasting step ships to production).

## 5. Preview noindex

Both `web/next.config.mjs` and `landing/next.config.mjs` send `X-Robots-Tag: noindex` on every route when `VERCEL_ENV !== "production"`. Vercel sets `VERCEL_ENV` automatically (`production` | `preview` | `development`) — no manual env var needed. Production is unaffected; preview and branch deploys are excluded from indexing.

## 6. Post-deploy checks

Run against both production domains after the first deploy:

- [ ] `curl -I https://app.sulitsend.com/api/health` → `200`
- [ ] `curl -I https://app.sulitsend.com/sitemap.xml` → `200`
- [ ] `curl -I https://sulitsend.com/sitemap.xml` → `200`
- [ ] OG card spot-check both domains at opengraph.xyz
- [ ] UptimeRobot monitor pointed at `https://app.sulitsend.com/api/health`
- [ ] Google Search Console: verify + submit sitemap for both domains
- [ ] Bing Webmaster Tools: verify + submit sitemap for both domains
- [ ] `curl -I https://app-<preview-hash>.vercel.app/` (any preview URL) → confirm `X-Robots-Tag: noindex` header present
