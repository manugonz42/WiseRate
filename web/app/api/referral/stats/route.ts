import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// GET /api/referral/stats — invited-friends count for /account/referral.
// `profiles_select_own` RLS only lets a user read their own row, so counting
// rows where `referred_by = me` needs the service-role client; the session
// cookie authenticates which id to scope the count to. Rewards stay 0 until
// T37 ships the ledger.
export async function GET() {
  const server = await createServerClient();
  const {
    data: { user },
  } = await server.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const service = createServiceClient();
  const { count, error } = await service
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invitedCount: count ?? 0, rewardsCount: 0 });
}
