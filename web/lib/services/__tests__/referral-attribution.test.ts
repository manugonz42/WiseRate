import { describe, expect, it, vi } from "vitest";
import { resolveReferral } from "../referral-attribution";

const VALID_CODE = "AB23CD45";
const REFERRER_ID = "referrer-1";
const NEW_USER_ID = "new-user-1";

describe("resolveReferral", () => {
  it("resolves the referrer id for a valid, unexpired, non-self code", async () => {
    const findReferrerId = vi.fn().mockResolvedValue(REFERRER_ID);
    const result = await resolveReferral({
      code: VALID_CODE,
      capturedAt: new Date().toISOString(),
      newUserId: NEW_USER_ID,
      findReferrerId,
    });
    expect(result).toBe(REFERRER_ID);
    expect(findReferrerId).toHaveBeenCalledWith(VALID_CODE);
  });

  it("returns null when no code is supplied", async () => {
    const findReferrerId = vi.fn();
    const result = await resolveReferral({
      newUserId: NEW_USER_ID,
      findReferrerId,
    });
    expect(result).toBeNull();
    expect(findReferrerId).not.toHaveBeenCalled();
  });

  it("returns null for a malformed code without looking it up", async () => {
    const findReferrerId = vi.fn();
    const result = await resolveReferral({
      code: "not-a-code",
      newUserId: NEW_USER_ID,
      findReferrerId,
    });
    expect(result).toBeNull();
    expect(findReferrerId).not.toHaveBeenCalled();
  });

  it("returns null for an unknown code (no referrer found)", async () => {
    const findReferrerId = vi.fn().mockResolvedValue(null);
    const result = await resolveReferral({
      code: VALID_CODE,
      newUserId: NEW_USER_ID,
      findReferrerId,
    });
    expect(result).toBeNull();
  });

  it("returns null for a self-referral (referrer id === new user id)", async () => {
    const findReferrerId = vi.fn().mockResolvedValue(NEW_USER_ID);
    const result = await resolveReferral({
      code: VALID_CODE,
      newUserId: NEW_USER_ID,
      findReferrerId,
    });
    expect(result).toBeNull();
  });

  it("returns null once capturedAt is past the 30-day window", async () => {
    const findReferrerId = vi.fn().mockResolvedValue(REFERRER_ID);
    const expired = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
    const result = await resolveReferral({
      code: VALID_CODE,
      capturedAt: expired,
      newUserId: NEW_USER_ID,
      findReferrerId,
    });
    expect(result).toBeNull();
    expect(findReferrerId).not.toHaveBeenCalled();
  });

  it("still resolves at exactly 29 days (inside the window)", async () => {
    const findReferrerId = vi.fn().mockResolvedValue(REFERRER_ID);
    const withinWindow = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString();
    const result = await resolveReferral({
      code: VALID_CODE,
      capturedAt: withinWindow,
      newUserId: NEW_USER_ID,
      findReferrerId,
    });
    expect(result).toBe(REFERRER_ID);
  });

  it("lowercases/trims the code before validating and looking it up", async () => {
    const findReferrerId = vi.fn().mockResolvedValue(REFERRER_ID);
    const result = await resolveReferral({
      code: `  ${VALID_CODE.toLowerCase()}  `,
      newUserId: NEW_USER_ID,
      findReferrerId,
    });
    expect(result).toBe(REFERRER_ID);
    expect(findReferrerId).toHaveBeenCalledWith(VALID_CODE);
  });
});
