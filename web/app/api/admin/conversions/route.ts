import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ingestConversion, type ConversionRow, type IngestConversionResult } from "@/lib/services/conversion-ingestion";

// POST /api/admin/conversions — manual MVP ingestion for a network's CSV/JSON
// export (docs/services/referral.md). Guarded by ADMIN_INGEST_TOKEN, a
// bearer token only we hold; there's no session to authenticate this route
// the normal cookie way since it's called by a human pasting a network
// export, not by the browser. Network postback webhooks are a later
// upgrade against the same tables.
interface ConversionsBody {
  conversions?: ConversionRow[];
}

export async function POST(request: Request) {
  const token = process.env.ADMIN_INGEST_TOKEN;
  const authHeader = request.headers.get("authorization");
  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as ConversionsBody;
  const rows = body.conversions;
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "Missing conversions." }, { status: 400 });
  }

  const service = createServiceClient();
  const results: Array<{
    externalRef: string;
    outcome: IngestConversionResult["outcome"] | "invalid_row" | "error";
  }> = [];

  for (const row of rows) {
    if (!row.clickId || !row.providerId || !row.eventType || !row.status || !row.externalRef) {
      results.push({ externalRef: row.externalRef ?? "unknown", outcome: "invalid_row" });
      continue;
    }

    let outcome: (typeof results)[number]["outcome"];
    try {
      const result = await ingestConversion(row, {
        getClick: async (clickId) => {
          const { data } = await service
            .from("affiliate_clicks")
            .select("id, user_id, provider_id")
            .eq("id", clickId)
            .maybeSingle();
          return data
            ? { id: data.id as string, userId: data.user_id as string | null, providerId: data.provider_id as string }
            : null;
        },
        recordClickConversion: async (clickId, r) => {
          const { error } = await service
            .from("affiliate_clicks")
            .update({
              event_type: r.eventType,
              amount: r.amount ?? null,
              currency: r.currency ?? null,
              conversion_status: r.status,
              external_ref: r.externalRef,
              converted_at: new Date().toISOString(),
            })
            .eq("id", clickId);
          // Surface e.g. the external_ref unique index firing on a different
          // click — swallowing it would leave the ledger silently out of sync
          // with the network's report.
          if (error) throw new Error(error.message);
        },
        getProfile: async (userId) => {
          const { data } = await service
            .from("profiles")
            .select("id, referred_by")
            .eq("id", userId)
            .maybeSingle();
          return data ? { id: data.id as string, referredBy: data.referred_by as string | null } : null;
        },
        findRewardByExternalRef: async (externalRef) => {
          const { data } = await service
            .from("referral_rewards")
            .select("id")
            .eq("external_ref", externalRef)
            .maybeSingle();
          return data ? { id: data.id as string } : null;
        },
        updateRewardStatus: async (rewardId, status) => {
          await service.from("referral_rewards").update({ status }).eq("id", rewardId);
        },
        findConversionRewardByReferredId: async (referredId) => {
          // `neq rejected`: a rejected first conversion must not block a later
          // approved one — the reward is for the first *confirmed* conversion
          // (docs/services/referral.md step 6).
          const { data } = await service
            .from("referral_rewards")
            .select("id")
            .eq("referred_id", referredId)
            .eq("kind", "conversion")
            .neq("status", "rejected")
            .limit(1)
            .maybeSingle();
          return data ? { id: data.id as string } : null;
        },
        insertReward: async (input) => {
          const { data, error } = await service
            .from("referral_rewards")
            .insert({
              referrer_id: input.referrerId,
              referred_id: input.referredId,
              click_id: input.clickId,
              kind: "conversion",
              provider_id: input.providerId,
              event_type: input.eventType,
              amount: input.amount ?? null,
              currency: input.currency ?? null,
              status: input.status,
              external_ref: input.externalRef,
            })
            .select("id")
            .single();
          if (error || !data) throw new Error(error?.message ?? "referral_rewards insert failed");
          return { id: data.id as string };
        },
      });
      outcome = result.outcome;
    } catch {
      // One bad row (DB write failure) must not abort the rest of the batch.
      outcome = "error";
    }

    results.push({ externalRef: row.externalRef, outcome });
  }

  return NextResponse.json({ results });
}
