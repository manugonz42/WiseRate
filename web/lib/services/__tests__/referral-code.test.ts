import { describe, expect, it } from "vitest";
import { generateReferralCode, generateUniqueReferralCode } from "../referral-code";

const VALID_CHARS = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]+$/;

describe("generateReferralCode", () => {
  it("is 8 chars, uppercase, from the confusable-free alphabet", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateReferralCode();
      expect(code).toHaveLength(8);
      expect(code).toBe(code.toUpperCase());
      expect(code).toMatch(VALID_CHARS);
    }
  });

  it("never contains 0, O, 1, or I", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateReferralCode();
      expect(code).not.toMatch(/[0O1I]/);
    }
  });
});

describe("generateUniqueReferralCode", () => {
  it("returns the first code when it doesn't collide", async () => {
    const codeExists = async () => false;
    const code = await generateUniqueReferralCode(codeExists);
    expect(code).toHaveLength(8);
  });

  it("retries on collision until a free code is found", async () => {
    let calls = 0;
    const codeExists = async () => {
      calls += 1;
      return calls < 3; // first two attempts collide, third is free
    };
    const code = await generateUniqueReferralCode(codeExists);
    expect(calls).toBe(3);
    expect(code).toHaveLength(8);
  });

  it("throws after exhausting retries", async () => {
    const codeExists = async () => true;
    await expect(generateUniqueReferralCode(codeExists)).rejects.toThrow(
      "Could not generate a unique referral code",
    );
  });
});
