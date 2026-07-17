import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { resolveClickTarget, appendClickRef } from "@/lib/services/click";

// POST /api/click — every affiliate/broker CTA routes through here first
// (docs/services/referral.md). Records an `affiliate_clicks` row (user_id
// from the session if logged in, null if anonymous — anonymous clicks are
// tracked for funnel data but can never produce a reward), then returns the
// outbound URL with the network's sub-ID param appended so its conversion
// report can be traced back to this click.
interface ClickBody {
  providerId?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ClickBody;
  const providerId = body.providerId;

  if (!providerId) {
    return NextResponse.json({ error: "Missing providerId." }, { status: 400 });
  }

  const target = resolveClickTarget(providerId);
  if (!target) {
    return NextResponse.json({ error: "Unknown provider." }, { status: 400 });
  }

  const server = await createServerClient();
  const {
    data: { user },
  } = await server.auth.getUser();

  const service = createServiceClient();
  const { data: click, error } = await service
    .from("affiliate_clicks")
    .insert({ user_id: user?.id ?? null, provider_id: providerId })
    .select("id")
    .single();

  // Tracking failure shouldn't block the user's outbound click.
  if (error || !click) {
    return NextResponse.json({ redirectURL: target.url });
  }

  return NextResponse.json({
    redirectURL: appendClickRef(target.url, target.subIdParam, click.id as string),
  });
}
