import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CouponValidation =
  | { valid: true; couponId: string; discountPercent: number }
  | { valid: false; error: string };

// Authoritative coupon check — re-run server-side wherever a discount is
// about to be applied (checkout preview, and again at order creation) so a
// client can never just send its own discount amount. Uses the admin
// client so it can see a user's past redemptions regardless of who's
// asking (needed at order-creation time, called with the customer's own
// id already established via their session).
export async function validateCoupon(
  admin: SupabaseClient,
  code: string,
  userId: string
): Promise<CouponValidation> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, error: "Enter a coupon code." };

  const { data: coupon } = await admin
    .from("coupons")
    .select("id, discount_percent, is_active, max_uses_per_user")
    .eq("code", normalized)
    .maybeSingle();

  if (!coupon || !coupon.is_active) {
    return { valid: false, error: "This coupon code is not valid." };
  }

  const { count } = await admin
    .from("coupon_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("coupon_id", coupon.id)
    .eq("user_id", userId);

  if ((count ?? 0) >= coupon.max_uses_per_user) {
    return { valid: false, error: "You've already used this coupon." };
  }

  return { valid: true, couponId: coupon.id, discountPercent: coupon.discount_percent };
}

export function applyDiscount(amount: number, discountPercent: number): number {
  const discounted = amount * (1 - discountPercent / 100);
  return Math.round(discounted * 100) / 100;
}

// Called once an order is truly confirmed (paid online, or placed as COD —
// never at online-order *creation*, so an abandoned/failed payment doesn't
// burn the customer's one-time coupon). Idempotent: the unique
// (coupon_id, user_id) constraint means calling this twice for the same
// order (e.g. both /verify and the webhook) is a harmless no-op.
export async function recordCouponRedemptionIfAny(
  admin: SupabaseClient,
  orderId: string
): Promise<void> {
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, coupon_code")
    .eq("id", orderId)
    .maybeSingle();

  if (!order?.coupon_code) return;

  const { data: coupon } = await admin
    .from("coupons")
    .select("id")
    .eq("code", order.coupon_code)
    .maybeSingle();

  if (!coupon) return;

  await admin
    .from("coupon_redemptions")
    .upsert(
      { coupon_id: coupon.id, user_id: order.user_id, order_id: order.id },
      { onConflict: "coupon_id,user_id", ignoreDuplicates: true }
    );
}
