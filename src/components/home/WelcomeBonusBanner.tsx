import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { WelcomeBonusModalClient } from "./WelcomeBonusModalClient";

// Eligibility check (logged in + hasn't redeemed WELCOME10) happens here,
// server-side, so ineligible visitors never even receive the popup's
// markup. The actual popup only appears right after a login/signup
// redirect (see WelcomeBonusModalClient) — not on every ordinary visit.
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
    <Suspense>
      <WelcomeBonusModalClient code={coupon.code} discountPercent={coupon.discount_percent} />
    </Suspense>
  );
}
