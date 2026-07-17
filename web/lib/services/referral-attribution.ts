// Attribution guards for referral signup (T36, docs/services/auth.md) — split
// from the complete-signup route so the guard logic is independently
// testable without mocking Supabase. The route supplies the actual lookup.

import { REFERRAL_CODE_ALPHABET } from "@/lib/services/referral-code";

const CODE_RE = new RegExp(`^[${REFERRAL_CODE_ALPHABET}]{8}$`);
const CAPTURE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface ResolveReferralInput {
  code?: string;
  capturedAt?: string;
  newUserId: string;
  findReferrerId: (code: string) => Promise<string | null>;
}

// Resolves an incoming referral code to a referrer id, or null if any guard
// fails: malformed code, expired capture, unknown code, or self-referral.
// Invalid input never throws — signup must proceed regardless of a bad code.
export async function resolveReferral(input: ResolveReferralInput): Promise<string | null> {
  if (!input.code) return null;
  const code = input.code.trim().toUpperCase();
  if (!CODE_RE.test(code)) return null;

  if (input.capturedAt) {
    const age = Date.now() - new Date(input.capturedAt).getTime();
    if (!Number.isFinite(age) || age > CAPTURE_TTL_MS) return null;
  }

  const referrerId = await input.findReferrerId(code);
  if (!referrerId || referrerId === input.newUserId) return null;
  return referrerId;
}
