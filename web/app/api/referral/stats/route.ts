import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// GET /api/referral/stats — invited/converted counts + months earned for
// /account/referral (docs/services/referral.md). `profiles_select_own` /
// `referral_rewards_select_own` RLS only let a user read their own rows, so
// counting across all referred users needs the service-role client; the
// session cookie authenticates which id to scope to. Per the T37 privacy
// rule, only aggregates are computed here — never which provider or amount
// a specific referred person converted at.
export async function GET() {
  const server = await createServerClient();
  const {
    data: { user },
  } = await server.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const service = createServiceClient();

  const { count: invitedCount, error: invitedError } = await service
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", user.id);

  if (invitedError) {
    return NextResponse.json({ error: invitedError.message }, { status: 500 });
  }

  const { data: rewards, error: rewardsError } = await service
    .from("referral_rewards")
    .select("status")
    .eq("referrer_id", user.id)
    .eq("kind", "conversion");

  if (rewardsError) {
    return NextResponse.json({ error: rewardsError.message }, { status: 500 });
  }

  // Reward model: 1 month per referred user's first confirmed conversion
  // (docs/plan/T37-referral-rewards.md) — one row per referred_id, so
  // pending + confirmed rows map directly to pending/confirmed months.
  const pendingMonths = rewards.filter((r) => r.status === "pending").length;
  const confirmedMonths = rewards.filter((r) => r.status === "confirmed").length;

  return NextResponse.json({
    invitedCount: invitedCount ?? 0,
    convertedCount: pendingMonths + confirmedMonths,
    pendingMonths,
    confirmedMonths,
  });
}
