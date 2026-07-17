import { describe, expect, it, vi } from "vitest";
import {
  ingestConversion,
  type ClickRecord,
  type IngestConversionDeps,
  type ProfileRecord,
} from "../conversion-ingestion";

const CLICK_ID = "click-1";
const REFERRER_ID = "referrer-1";
const REFERRED_ID = "referred-1";

const baseRow = {
  clickId: CLICK_ID,
  providerId: "wise",
  eventType: "sale" as const,
  amount: 250,
  currency: "EUR",
  status: "confirmed" as const,
  externalRef: "ext-1",
};

function makeDeps(overrides: Partial<IngestConversionDeps> = {}): IngestConversionDeps {
  return {
    getClick: vi.fn(),
    recordClickConversion: vi.fn().mockResolvedValue(undefined),
    getProfile: vi.fn(),
    findRewardByExternalRef: vi.fn().mockResolvedValue(null),
    updateRewardStatus: vi.fn().mockResolvedValue(undefined),
    findConversionRewardByReferredId: vi.fn().mockResolvedValue(null),
    insertReward: vi.fn().mockResolvedValue({ id: "reward-1" }),
    ...overrides,
  };
}

describe("ingestConversion", () => {
  it("returns unknown_click and never records anything for a missing click", async () => {
    const deps = makeDeps({ getClick: vi.fn().mockResolvedValue(null) });
    const result = await ingestConversion(baseRow, deps);
    expect(result).toEqual({ outcome: "unknown_click" });
    expect(deps.recordClickConversion).not.toHaveBeenCalled();
  });

  it("records the click conversion but grants no reward for an anonymous click", async () => {
    const click: ClickRecord = { id: CLICK_ID, userId: null, providerId: "wise" };
    const deps = makeDeps({ getClick: vi.fn().mockResolvedValue(click) });
    const result = await ingestConversion(baseRow, deps);
    expect(result).toEqual({ outcome: "anonymous_click" });
    expect(deps.recordClickConversion).toHaveBeenCalledWith(CLICK_ID, baseRow);
    expect(deps.insertReward).not.toHaveBeenCalled();
  });

  it("records the click conversion but grants no reward for a non-referred user", async () => {
    const click: ClickRecord = { id: CLICK_ID, userId: "user-1", providerId: "wise" };
    const profile: ProfileRecord = { id: "user-1", referredBy: null };
    const deps = makeDeps({
      getClick: vi.fn().mockResolvedValue(click),
      getProfile: vi.fn().mockResolvedValue(profile),
    });
    const result = await ingestConversion(baseRow, deps);
    expect(result).toEqual({ outcome: "not_referred" });
    expect(deps.insertReward).not.toHaveBeenCalled();
  });

  it("creates one reward row for a referred user's first conversion", async () => {
    const click: ClickRecord = { id: CLICK_ID, userId: REFERRED_ID, providerId: "wise" };
    const profile: ProfileRecord = { id: REFERRED_ID, referredBy: REFERRER_ID };
    const deps = makeDeps({
      getClick: vi.fn().mockResolvedValue(click),
      getProfile: vi.fn().mockResolvedValue(profile),
    });
    const result = await ingestConversion(baseRow, deps);
    expect(result).toEqual({ outcome: "created", rewardId: "reward-1" });
    expect(deps.insertReward).toHaveBeenCalledWith({
      referrerId: REFERRER_ID,
      referredId: REFERRED_ID,
      clickId: CLICK_ID,
      providerId: "wise", // from the click, not the submitted row
      eventType: baseRow.eventType,
      amount: baseRow.amount,
      currency: baseRow.currency,
      status: baseRow.status,
      externalRef: baseRow.externalRef,
    });
  });

  it("re-importing the same external_ref updates status instead of inserting a duplicate", async () => {
    const click: ClickRecord = { id: CLICK_ID, userId: REFERRED_ID, providerId: "wise" };
    const profile: ProfileRecord = { id: REFERRED_ID, referredBy: REFERRER_ID };
    const deps = makeDeps({
      getClick: vi.fn().mockResolvedValue(click),
      getProfile: vi.fn().mockResolvedValue(profile),
      findRewardByExternalRef: vi.fn().mockResolvedValue({ id: "reward-1" }),
    });
    const result = await ingestConversion({ ...baseRow, status: "rejected" }, deps);
    expect(result).toEqual({ outcome: "updated", rewardId: "reward-1" });
    expect(deps.updateRewardStatus).toHaveBeenCalledWith("reward-1", "rejected");
    expect(deps.insertReward).not.toHaveBeenCalled();
  });

  it("a rejected conversion still updates the existing reward's status, not a new one", async () => {
    const click: ClickRecord = { id: CLICK_ID, userId: REFERRED_ID, providerId: "wise" };
    const profile: ProfileRecord = { id: REFERRED_ID, referredBy: REFERRER_ID };
    const deps = makeDeps({
      getClick: vi.fn().mockResolvedValue(click),
      getProfile: vi.fn().mockResolvedValue(profile),
    });
    const result = await ingestConversion({ ...baseRow, status: "rejected" }, deps);
    expect(result).toEqual({ outcome: "created", rewardId: "reward-1" });
    expect(deps.insertReward).toHaveBeenCalledWith(
      expect.objectContaining({ status: "rejected" }),
    );
  });

  it("a referred user's second, different conversion earns no additional reward", async () => {
    const click: ClickRecord = { id: "click-2", userId: REFERRED_ID, providerId: "remitly" };
    const profile: ProfileRecord = { id: REFERRED_ID, referredBy: REFERRER_ID };
    const deps = makeDeps({
      getClick: vi.fn().mockResolvedValue(click),
      getProfile: vi.fn().mockResolvedValue(profile),
      findConversionRewardByReferredId: vi.fn().mockResolvedValue({ id: "reward-1" }),
    });
    const result = await ingestConversion({ ...baseRow, clickId: "click-2", externalRef: "ext-2" }, deps);
    expect(result).toEqual({ outcome: "already_rewarded" });
    expect(deps.insertReward).not.toHaveBeenCalled();
  });
});
