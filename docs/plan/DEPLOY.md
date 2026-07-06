# Deploy runbook — web + landing

Two separate Vercel projects, one repo. Root domain is the landing marketing site; the app lives on a subdomain.

## 1. Vercel projects

| Project | Root directory | Domain | Framework preset |
|---|---|---|---|
| `sulitsend-web` | `web/` | `app.sulitsend.app` | Next.js |
| `sulitsend-landing` | `landing/` | `sulitsend.app` (+ `www.sulitsend.app` → redirect) | Next.js |

Import the repo twice in Vercel (once per project), setting each project's **Root Directory** in Project Settings → General. Both build with the default `npm install && npm run build`.

## 2. DNS records

Point these at Vercel per its dashboard instructions (exact values shown when you add each domain in Vercel → Project → Settings → Domains):

- `sulitsend.app` (apex) → A/ALIAS record to Vercel, for `sulitsend-landing`
- `www.sulitsend.app` → CNAME to Vercel, redirect to apex (configure in `sulitsend-landing`'s domain settings)
- `app.sulitsend.app` → CNAME to Vercel, for `sulitsend-web`

## 3. Environment variables

### `sulitsend-web` (Vercel → Settings → Environment Variables)

| Var | Required | Unset fallback |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Set to `https://app.sulitsend.app` | falls back to `https://app.sulitsend.app` in code, but set explicitly so it survives a future rename |
| `NEXT_PUBLIC_POSTHOG_KEY` | Set once PostHog account exists | analytics no-ops (console.info in dev, silent in prod) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Set to `https://eu.i.posthog.com` (EU data residency) | defaults to `https://eu.i.posthog.com` |
| `UPSTASH_REDIS_REST_URL` | Set once Upstash DB exists | falls back to in-memory Map cache (fine for one instance, resets per deploy) |
| `UPSTASH_REDIS_REST_TOKEN` | Set alongside the URL above | same fallback as above |

### `sulitsend-landing`

| Var | Required | Unset fallback |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Set to `https://sulitsend.app` | falls back to `https://sulitsend.app` in code |
| `NEXT_PUBLIC_APP_URL` | Set to `https://app.sulitsend.app/compare` | falls back to same value in code |
| `NEXT_PUBLIC_CORRIDOR_URL` | Set to `https://app.sulitsend.app/send/eur-to-php` | falls back to same value in code |

All three landing vars are redundant with their code fallbacks today (same domains) — set them anyway so a future domain change is a Vercel env edit, not a redeploy.

## 4. Hobby → Pro

Vercel's Hobby tier forbids commercial use. **Flip both projects to Pro before any affiliate link goes live** (i.e. before the human checklist's affiliate-URL-pasting step ships to production).

## 5. Preview noindex

Both `web/next.config.mjs` and `landing/next.config.mjs` send `X-Robots-Tag: noindex` on every route when `VERCEL_ENV !== "production"`. Vercel sets `VERCEL_ENV` automatically (`production` | `preview` | `development`) — no manual env var needed. Production is unaffected; preview and branch deploys are excluded from indexing.

## 6. Post-deploy checks

Run against both production domains after the first deploy:

- [ ] `curl -I https://app.sulitsend.app/api/health` → `200`
- [ ] `curl -I https://app.sulitsend.app/sitemap.xml` → `200`
- [ ] `curl -I https://sulitsend.app/sitemap.xml` → `200`
- [ ] OG card spot-check both domains at opengraph.xyz
- [ ] UptimeRobot monitor pointed at `https://app.sulitsend.app/api/health`
- [ ] Google Search Console: verify + submit sitemap for both domains
- [ ] Bing Webmaster Tools: verify + submit sitemap for both domains
- [ ] `curl -I https://app-<preview-hash>.vercel.app/` (any preview URL) → confirm `X-Robots-Tag: noindex` header present
