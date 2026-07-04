import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseAnonKey } from "./env";

// Used inside Client Components only. Relies on the public anon key, which
// is safe to expose — all real authorization happens via RLS policies.
export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
