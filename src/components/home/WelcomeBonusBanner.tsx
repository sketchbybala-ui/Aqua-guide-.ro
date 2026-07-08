import { createClient } from "@/lib/supabase/server";

// Shown to any logged-in customer who hasn't yet redeemed the welcome
// coupon — renders nothing for guests or once it's been used. This is a
// server component so the check happens before any HTML is sent (no
// client-side flash of the banner for users who've already redeemed it).
export async function WelcomeBonusBanner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: coupon } = await supabase
    .from("coupons")
    .select("id, code, discount_percent")
    .eq("code", "WELCOME10")
    .eq("is_active", true)
    .maybeSingle();

  if (!coupon) return null;

  const { count } = await supabase
    .from("coupon_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("coupon_id", coupon.id)
    .eq("user_id", user.id);

  if ((count ?? 0) > 0) return null;

  return (
    <div className="bg-brand-600">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 py-2.5 text-center text-sm text-white sm:px-6">
        <span>
          🎉 Welcome! Use code{" "}
          <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono font-semibold">
            {coupon.code}
          </span>{" "}
          at checkout for {coupon.discount_percent}% off your order.
        </span>
      </div>
    </div>
  );
}
