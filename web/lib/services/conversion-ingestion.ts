// Conversion-ingestion resolution for T37 (docs/services/referral.md) —
// split from the /api/admin/conversions route so the resolution algorithm
// is independently testable without mocking Supabase, same convention as
// referral-attribution.ts. The route supplies the actual Supabase-backed
// lookups/writes.

export type ConversionEventType = "lead" | "sale";
export type ConversionStatus = "pending" | "confirmed" | "rejected";

export interface ConversionRow {
  clickId: string;
  providerId: string;
  eventType: ConversionEventType;
  amount?: number;
  currency?: string;
  status: ConversionStatus;
  externalRef: string;
}

export interface ClickRecord {
  id: string;
  userId: string | null;
  // The provider recorded at click time — authoritative over whatever the
  // network's CSV export claims (docs/plan/T37-referral-rewards.md).
  providerId: string;
}

export interface ProfileRecord {
  id: string;
  referredBy: string | null;
}

export interface RewardRecord {
  id: string;
}

export interface IngestConversionDeps {
  getClick: (clickId: string) => Promise<ClickRecord | null>;
  // Always runs, referred or not — "always record which provider the user
  // converted at" (T37 binding decision).
  recordClickConversion: (clickId: string, row: ConversionRow) => Promise<void>;
  getProfile: (userId: string) => Promise<ProfileRecord | null>;
  findRewardByExternalRef: (externalRef: string) => Promise<RewardRecord | null>;
  updateRewardStatus: (rewardId: string, status: ConversionStatus) => Promise<void>;
  // Must exclude rejected rewards: a rejected first conversion doesn't block
  // a later approved one from earning (docs/services/referral.md step 6).
  findConversionRewardByReferredId: (referredId: string) => Promise<RewardRecord | null>;
  insertReward: (input: {
    referrerId: string;
    referredId: string;
    clickId: string;
    providerId: string;
    eventType: ConversionEventType;
    amount?: number;
    currency?: string;
    status: ConversionStatus;
    externalRef: string;
  }) => Promise<RewardRecord>;
}

export type IngestConversionResult =
  | { outcome: "unknown_click" }
  | { outcome: "anonymous_click" }
  | { outcome: "not_referred" }
  | { outcome: "updated"; rewardId: string }
  | { outcome: "already_rewarded" }
  | { outcome: "created"; rewardId: string };

// One conversion row in, one outcome out. Two independent guarantees:
//  - idempotent on external_ref (re-importing the same CSV row is a no-op
//    beyond a status refresh)
//  - one non-rejected reward per referred_id (only a referred user's *first*
//    confirmed conversion earns a reward — later conversions still update
//    the click row but produce no additional reward)
export async function ingestConversion(
  row: ConversionRow,
  deps: IngestConversionDeps,
): Promise<IngestConversionResult> {
  const click = await deps.getClick(row.clickId);
  if (!click) return { outcome: "unknown_click" };

  await deps.recordClickConversion(click.id, row);

  if (!click.userId) return { outcome: "anonymous_click" };

  const profile = await deps.getProfile(click.userId);
  if (!profile?.referredBy) return { outcome: "not_referred" };

  const existing = await deps.findRewardByExternalRef(row.externalRef);
  if (existing) {
    await deps.updateRewardStatus(existing.id, row.status);
    return { outcome: "updated", rewardId: existing.id };
  }

  const alreadyRewarded = await deps.findConversionRewardByReferredId(profile.id);
  if (alreadyRewarded) return { outcome: "already_rewarded" };

  const reward = await deps.insertReward({
    referrerId: profile.referredBy,
    referredId: profile.id,
    clickId: click.id,
    providerId: click.providerId,
    eventType: row.eventType,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    externalRef: row.externalRef,
  });
  return { outcome: "created", rewardId: reward.id };
}
