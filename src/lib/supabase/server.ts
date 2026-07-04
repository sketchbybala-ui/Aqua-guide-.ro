import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseUrl, getSupabaseAnonKey } from "./env";

// Used inside Server Components, Server Actions, and Route Handlers.
// `cookies()` is async (Next.js 15+/16 Async Request APIs), so this
// factory function must always be awaited by callers.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — the proxy (proxy.ts)
            // already refreshes the session cookie, so this is safe to ignore.
          }
        },
      },
    }
  );
}
