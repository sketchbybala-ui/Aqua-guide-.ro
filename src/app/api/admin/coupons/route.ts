import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Admin-only: create a new coupon. requireAdmin redirects non-admins;
// customers have no write policy on coupons at all, so this always goes
// through the service-role client.
export async function POST(request: Request) {
  await requireAdmin();

  const { code, discountPercent, maxUsesPerUser } = await request
    .json()
    .catch(() => ({}));

  const normalizedCode = typeof code === "string" ? code.trim().toUpperCase() : "";
  const discount = Number(discountPercent);
  const maxUses = Number(maxUsesPerUser) || 1;

  if (!normalizedCode) {
    return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 });
  }
  if (!Number.isFinite(discount) || discount <= 0 || discount > 100) {
    return NextResponse.json(
      { error: "Discount must be a number between 1 and 100." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.from("coupons").insert({
    code: normalizedCode,
    discount_percent: discount,
    max_uses_per_user: maxUses,
    is_active: true,
  });

  if (error) {
    const message = error.code === "23505" ? "That coupon code already exists." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
