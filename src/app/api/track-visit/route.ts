import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Records one page view. Fired from the client on every route change (see
// VisitorTracker). No RLS insert policy exists for page_views — this
// always writes via the service-role client — but we still read the
// caller's own session (if any) so logged-in visits can be attributed.
export async function POST(request: Request) {
  const { path } = await request.json().catch(() => ({}));
  if (typeof path !== "string" || !path) {
    return NextResponse.json({ error: "path is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  await admin.from("page_views").insert({
    path: path.slice(0, 512),
    user_id: user?.id ?? null,
  });

  return NextResponse.json({ ok: true });
}
