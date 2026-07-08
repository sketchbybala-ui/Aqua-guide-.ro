import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Admin-only: grant or revoke another user's admin flag. requireAdmin
// redirects non-admins before this ever runs; the service-role client is
// used for the write since profiles_update_own's block_admin_escalation
// trigger blocks a user from ever setting is_admin on their own row (by
// design), and this route only ever targets other users' rows.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin_ = await requireAdmin();
  const { id } = await params;
  const { is_admin } = await request.json().catch(() => ({}));

  if (typeof is_admin !== "boolean") {
    return NextResponse.json({ error: "is_admin must be true or false" }, { status: 400 });
  }

  if (id === admin_.id && !is_admin) {
    return NextResponse.json(
      { error: "You can't remove your own admin access." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ is_admin }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
