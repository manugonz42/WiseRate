# Deploy runbook — web + landing

Two separate Vercel projects, one repo. Root domain is the landing marketing site; the app lives on a subdomain.

## Status (2026-07-14)

Executed: Cloudflare DNS (3 records, DNS-only), both Vercel projects created (team `grow-glow`), domains verified, prod env vars set, www→apex 308 redirect, `rootDirectory` set, first production deploys live. Pending:

- [ ] **Git integration**: GitHub login connection added (2026-07-14), but `vercel git connect` still fails with "make sure you have access to the repository" — the **Vercel GitHub App** isn't installed on the repo. Install at [github.com/apps/vercel](https://github.com/apps/vercel) → Configure → grant `manugonz42/WiseRate`, then rerun `vercel git connect https://github.com/manugonz42/WiseRate.git --yes` from `web/` and `landing/`. Until then pushes don't auto-deploy — and CLI deploys from subdirs now fail (rootDirectory is set); use git integration or `vercel link --repo`.
- [ ] Post-deploy checks below. Note: this dev machine's network (FortiGuard DNS filter) blocks `sulitsend.com` as a newly-registered domain (resolves to 208.91.112.55) — global DNS verified correct via DoH; run the curls from another network or request recategorization at fortiguard.com/webfilter.

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
