// Browser Supabase client — anon key, RLS-scoped to the signed-in user.
// Never import this outside lib/services/auth.ts; components call AuthService.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
