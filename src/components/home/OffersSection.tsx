import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Publicly visible offers strip — deliberately curated (just the intended
// welcome coupon), not a raw dump of every row in the coupons table. Admin-
// created codes (promo codes for specific customers, etc.) should never
// surface here just by existing and being active.
const FEATURED_COUPON_CODE = "WELCOME10";

export async function OffersSection() {
  const supabase = await createClient();

  const { data: coupon } = await supabase
    .from("coupons")
    .select("id, code, discount_percent")
    .eq("code", FEATURED_COUPON_CODE)
    .eq("is_active", true)
    .maybeSingle();

  if (!coupon) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { count } = await supabase
      .from("coupon_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("coupon_id", coupon.id)
      .eq("user_id", user.id);
    if ((count ?? 0) > 0) return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white px-6 py-8 sm:px-10">
        <div
          className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-brand-200/50 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
              Special Offer
            </span>
            <h2 className="font-heading mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
              Get {coupon.discount_percent}% Off Your First Order
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              New here? Sign up and use this code at checkout.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="rounded-xl border-2 border-dashed border-brand-300 bg-white px-5 py-3 font-mono text-lg font-bold tracking-wider text-brand-700">
              {coupon.code}
            </span>
            <Link
              href={user ? "/home-use" : "/signup"}
              className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {user ? "Shop Now" : "Sign Up"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
