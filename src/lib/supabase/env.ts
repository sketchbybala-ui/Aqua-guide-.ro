// Falls back to harmless placeholder values instead of letting
// @supabase/ssr/@supabase/supabase-js throw synchronously when an env var
// is missing. Without this, a single unset env var crashes every page that
// touches Supabase with a raw 500 instead of degrading gracefully (empty
// data, failed auth) — which is what actually happens once real env vars
// are configured in Vercel anyway. Configure the real values in Vercel's
// Project Settings -> Environment Variables; see SETUP.md.
export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";
}
