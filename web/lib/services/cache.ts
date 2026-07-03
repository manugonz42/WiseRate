// Shared KV cache — Upstash Redis (REST) when configured, else an in-memory
// Map so local dev works with zero setup (docs/services/exchange-rate.md).
// Upstash errors are logged and treated as a cache miss: the cache being
// down must never fail the request it's caching.

import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const memory = new Map<string, { at: number; ttlMs: number; value: string }>();

export async function getCached<T>(key: string): Promise<T | null> {
  if (redis) {
    try {
      const value = await redis.get<T>(key);
      return value ?? null;
    } catch (err) {
      console.error("[cache] Upstash get failed:", err);
      return null;
    }
  }

  const hit = memory.get(key);
  if (!hit || Date.now() - hit.at >= hit.ttlMs) return null;
  return JSON.parse(hit.value) as T;
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  if (redis) {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
    } catch (err) {
      console.error("[cache] Upstash set failed:", err);
    }
    return;
  }

  memory.set(key, { at: Date.now(), ttlMs: ttlSeconds * 1000, value: JSON.stringify(value) });
}
