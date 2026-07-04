import { createBrowserClient } from "@supabase/ssr";

// Used inside Client Components only. Relies on the public anon key, which
// is safe to expose — all real authorization happens via RLS policies.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
