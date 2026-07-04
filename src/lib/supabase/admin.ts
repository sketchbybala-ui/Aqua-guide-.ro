import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "./env";

// Service-role client — bypasses RLS entirely. Only ever import this from
// server-only code (Route Handlers, the seed script): create-order,
// verify, admin product writes, cart clearing after payment. The
// `server-only` import makes any accidental client-side import a build error.
export function createAdminClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
