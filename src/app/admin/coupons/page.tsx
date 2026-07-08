import { createClient } from "@/lib/supabase/server";
import { CouponForm } from "@/components/admin/CouponForm";
import { CouponToggle } from "@/components/admin/CouponToggle";

// Reads coupons + redemption counts — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const supabase = await createClient();

  const [{ data: coupons }, { data: redemptions }] = await Promise.all([
    supabase.from("coupons").select("*").order("created_at", { ascending: false }),
    supabase.from("coupon_redemptions").select("coupon_id"),
  ]);

  const redemptionCounts = new Map<string, number>();
  for (const r of redemptions ?? []) {
    redemptionCounts.set(r.coupon_id, (redemptionCounts.get(r.coupon_id) ?? 0) + 1);
  }

  return (
    <div>
      <CouponForm />

      {!coupons || coupons.length === 0 ? (
        <p className="text-sm text-slate-500">No coupons yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Max Uses / Customer</th>
                <th className="px-4 py-3">Redeemed</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">{c.code}</td>
                  <td className="px-4 py-3 text-slate-600">{c.discount_percent}%</td>
                  <td className="px-4 py-3 text-slate-600">{c.max_uses_per_user}</td>
                  <td className="px-4 py-3 text-slate-600">{redemptionCounts.get(c.id) ?? 0}</td>
                  <td className="px-4 py-3">
                    {c.is_active ? (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CouponToggle couponId={c.id} isActive={c.is_active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
