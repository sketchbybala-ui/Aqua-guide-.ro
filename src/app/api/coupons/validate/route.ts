import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateCoupon, applyDiscount } from "@/lib/coupons";

// Live checkout preview only — does not reserve/redeem anything. The
// subtotal is always recomputed here from the user's own cart (never
// trusted from the client), same authoritative-total pattern as
// create-order and the COD route.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { code } = await request.json().catch(() => ({}));
  if (typeof code !== "string") {
    return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 });
  }

  const admin = createAdminClient();
  const result = await validateCoupon(admin, code, user.id);

  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { data: cartRows } = await supabase
    .from("cart_items")
    .select("quantity, products(price)")
    .eq("user_id", user.id);

  const lines = (cartRows ?? []) as unknown as {
    quantity: number;
    products: { price: number } | null;
  }[];
  const subtotal = lines.reduce(
    (sum, l) => sum + (l.products?.price ?? 0) * l.quantity,
    0
  );

  const total = applyDiscount(subtotal, result.discountPercent);

  return NextResponse.json({
    valid: true,
    discountPercent: result.discountPercent,
    subtotal,
    discountAmount: Math.round((subtotal - total) * 100) / 100,
    total,
  });
}
