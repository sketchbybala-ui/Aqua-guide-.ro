import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Admin-only: toggle a coupon's active state.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const { is_active } = await request.json().catch(() => ({}));

  if (typeof is_active !== "boolean") {
    return NextResponse.json({ error: "is_active must be true or false" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("coupons").update({ is_active }).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
