import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// vitest runs this file under the "node" environment (vitest.config.ts) — no
// window/localStorage global. persistence.ts's SSR guards check
// `typeof window === "undefined"`, so a minimal fake is stubbed in for the
// duration of each test (same vi.stubGlobal pattern as auth.test.ts's fetch).
class FakeLocalStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

let fakeStorage: FakeLocalStorage;

beforeEach(() => {
  fakeStorage = new FakeLocalStorage();
  vi.stubGlobal("window", { localStorage: fakeStorage });
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-07-17T00:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const { captureReferralCode, getReferralCapture } = await import("../persistence");

const VALID_CODE = "AB23CD45";

describe("captureReferralCode / getReferralCapture", () => {
  it("stores a valid code and reads it back", () => {
    expect(captureReferralCode(VALID_CODE)).toBe(true);
    expect(getReferralCapture()).toEqual({ code: VALID_CODE, at: "2026-07-17T00:00:00.000Z" });
  });

  it("uppercases and trims before storing", () => {
    captureReferralCode(`  ${VALID_CODE.toLowerCase()}  `);
    expect(getReferralCapture()?.code).toBe(VALID_CODE);
  });

  it("rejects a malformed code (wrong length / confusable chars) as a no-op", () => {
    expect(captureReferralCode("SHORT")).toBe(false);
    expect(captureReferralCode("AAAA000I")).toBe(false); // contains 0 and I
    expect(getReferralCapture()).toBeNull();
  });

  it("returns null when nothing has been captured", () => {
    expect(getReferralCapture()).toBeNull();
  });

  it("last-touch wins: a newer capture overwrites the previous one", () => {
    captureReferralCode(VALID_CODE);
    vi.advanceTimersByTime(60_000);
    captureReferralCode("ZZ99YY88");
    expect(getReferralCapture()).toEqual({
      code: "ZZ99YY88",
      at: "2026-07-17T00:01:00.000Z",
    });
  });

  it("is still readable just under the 30-day expiry", () => {
    captureReferralCode(VALID_CODE);
    vi.advanceTimersByTime(30 * 24 * 60 * 60 * 1000 - 1);
    expect(getReferralCapture()?.code).toBe(VALID_CODE);
  });

  it("expires and clears the stored code past 30 days", () => {
    captureReferralCode(VALID_CODE);
    vi.advanceTimersByTime(30 * 24 * 60 * 60 * 1000 + 1);
    expect(getReferralCapture()).toBeNull();
    // clearing on read: a direct localStorage check confirms the key is gone
    expect(fakeStorage.getItem("sulitsend.ref.v1")).toBeNull();
  });
});
