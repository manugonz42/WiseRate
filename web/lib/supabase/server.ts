// Server Supabase client (Server Components, Route Handlers) — anon key +
// the caller's session cookies, RLS-scoped exactly like the browser client.
// Cookie writes are a no-op from a Server Component render (Next.js forbids
// it there); middleware.ts is what actually refreshes the session cookie.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // called from a Server Component render — safe to ignore
          }
        },
      },
    },
  );
}
