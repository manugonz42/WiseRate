# T20 — Deploy readiness: runbook + env hygiene

## Dependencies
- **Reads:** `web/.env.example`, `web/next.config.*`, `landing/` (config, env), `web/lib/site.ts`, [ROADMAP Phase 1](../ROADMAP.md), plan README human checklist
- **Task deps:** T17–T19 (what gets deployed is final)

## Used by
- The human executing the Vercel/domain checklist; UptimeRobot, Search Console setup

## Goal
Everything code-side needed so the human can deploy both projects in one sitting from a written runbook — and previews can't leak into Google.

## Pre-made decisions
- **Runbook at `docs/plan/DEPLOY.md`** (checked in, referenced from the human checklist). Contents: two Vercel projects (`web/` → `app.sulitsend.app`, `landing/` → root `sulitsend.app`); DNS records; env-var table per project — `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_POSTHOG_KEY`/`_HOST`, Upstash `UPSTASH_REDIS_REST_URL`/`_TOKEN` (names verified against code, not from memory), landing's `APP_URL`/site URL if env-driven; Hobby→Pro note (Hobby forbids commercial use — flip before affiliate links go live); post-deploy checks (`/api/health` 200, `/sitemap.xml` both domains, OG spot-check, UptimeRobot on `/api/health`, Search Console + Bing submissions).
- **Preview noindex:** in **both** `web` and `landing` next.config, add an `X-Robots-Tag: noindex` header for all routes when `process.env.VERCEL_ENV !== "production"`. Production behavior unchanged.
- **Env audit:** `.env.example` in both projects lists every env var the code reads (grep `process.env.` and reconcile); each with a one-line comment and its unset-fallback behavior.
- **Landing cross-links:** confirm `landing/lib/config.ts` URLs and the app's landing references agree with the final domain split; fix any hardcoded localhost/wrong-domain strings in either project.
- **Merge to `main`:** this branch (`web/desktop-compare-redesign`) carries T12+ unmerged. Merge into `main` locally as the last step of this task; **the human pushes** (never force-push).

## Steps
1. Preview-noindex headers (web + landing).
2. Env audit → fix `.env.example`s.
3. Cross-link/domain sweep (grep both projects for `localhost`, `sulitsend`, `wiserate` in URLs).
4. Write `DEPLOY.md`; rewrite the plan-README human checklist deploy items to point at it.
5. `npm run build` in **both** projects; merge branch → `main` locally; check off T20.

## Verify
Both builds green. `curl -I` a dev-server route with `VERCEL_ENV=preview` set shows the noindex header; unset/production does not. `npm test && npm run lint` (web).

## Out of scope
Buying the domain, creating Vercel/PostHog/Upstash/UptimeRobot accounts, pushing to remote, Resend (Phase 3).
