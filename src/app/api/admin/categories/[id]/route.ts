import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Admin-only: edit a category's name/description. The categories_admin_write
// RLS policy already permits this for admin sessions, but the service-role
// client is used here for consistency with the rest of /api/admin/*.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const { name, description } = await request.json().catch(() => ({}));

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("categories")
    .update({ name: name.trim(), description: description ?? null })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
