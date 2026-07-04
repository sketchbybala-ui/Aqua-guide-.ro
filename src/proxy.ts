import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/env";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (function renamed to
// `proxy`) — this is otherwise the standard @supabase/ssr session-refresh
// pattern: it keeps the auth cookie valid on every request. This is an
// optimistic, cookie-only refresh — it is NOT the authorization check.
// Real authorization (e.g. is_admin) happens server-side in admin/layout.tsx
// and inside each Route Handler, per Next.js's Data Access Layer guidance.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the session token if it's expired. Required for Server
  // Components, which can't write cookies themselves. Wrapped defensively
  // so a misconfigured/unreachable Supabase project can't take down every
  // route on the site (proxy runs on nearly every request).
  try {
    await supabase.auth.getUser();
  } catch {
    // Fall through — the request proceeds unauthenticated.
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
