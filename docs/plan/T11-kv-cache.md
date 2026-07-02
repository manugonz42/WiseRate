# T11 — Quotes cache → Upstash KV (Phase 3)

## Dependencies
- **Reads:** [exchange-rate](../services/exchange-rate.md) (Known source limitations → "Serverless cache reality"), [ROADMAP](../ROADMAP.md) Phase 3
- **Task deps:** none (T01's tests protect the refactor); human must create the Upstash database for prod

## Used by
- `/api/quotes` hit rate in prod (in-memory Map dies on serverless cold starts); later Phase 3 cron

## Goal
Replace the in-memory quotes cache with Upstash Redis (REST), falling back to the current Map when env vars are absent (local dev keeps working with zero setup).

## Pre-made decisions
- `npm i @upstash/redis`. Env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (add to `web/.env.example`).
- `web/lib/services/cache.ts`: `getCached<T>(key): Promise<T | null>` / `setCached<T>(key, value, ttlSeconds)` — Upstash `get/set` with `{ ex: ttl }` when env present, else the existing Map logic. JSON-serialize values.
- Key format: `quotes:v1:${from}:${to}:${amount}`; TTL stays **120 s** (spec). Upstash errors → log + behave as cache miss (never fail the request because the cache is down).

## Steps
1. Build `cache.ts`; refactor `web/lib/services/quotes.ts` to use it (delete the inline Map).
2. Vitest for the fallback path (no env → Map behavior: second call within TTL returns the first value; use fake timers).
3. Update `docs/services/exchange-rate.md`: rewrite the "Serverless cache reality" bullet to reflect KV + Map fallback.
4. Check off T11.

## Verify
Local (no env): `/compare` works; two rapid `/api/quotes` calls → sources fetched once (check server logs). With test Upstash creds in `.env.local`: keys appear in the Upstash console with TTL ≈ 120 s. `npm test && npm run build && npm run lint`.

## Out of scope
Caching `/api/history` (Next `revalidate` already covers it), cron jobs, alert storage, migrating T06's localStorage.
