import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// No Upstash env vars set -> cache.ts falls back to its in-memory Map.
describe("cache (Map fallback, no Upstash env)", () => {
  beforeEach(() => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("returns null for a key that was never set", async () => {
    const { getCached } = await import("../cache");
    expect(await getCached("missing")).toBeNull();
  });

  it("a second call within the TTL returns the first cached value", async () => {
    const { getCached, setCached } = await import("../cache");
    await setCached("k", { hello: "world" }, 120);

    vi.advanceTimersByTime(60_000);
    expect(await getCached("k")).toEqual({ hello: "world" });
  });

  it("expires the value once the TTL elapses", async () => {
    const { getCached, setCached } = await import("../cache");
    await setCached("k", { hello: "world" }, 120);

    vi.advanceTimersByTime(120_001);
    expect(await getCached("k")).toBeNull();
  });
});
