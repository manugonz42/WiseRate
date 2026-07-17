// Service-role Supabase client — bypasses RLS. Server-only: never import
// from a Client Component or anything bundled to the browser. Used for the
// handful of writes the "server-only" RLS policies require (profile
// creation, referral_rewards / affiliate_clicks inserts).

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
