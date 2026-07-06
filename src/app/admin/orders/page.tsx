import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

// Reads every user's orders (allowed for admins by the
// orders_admin_select_all RLS policy) — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_amount, shipping_name, shipping_phone, created_at")
    .order("created_at", { ascending: false });

  if (!orders || orders.length === 0) {
    return <p className="text-sm text-slate-500">No orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Placed</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-3 font-medium text-slate-900">
                #{order.id.slice(0, 8)}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {order.shipping_name || "—"}
                {order.shipping_phone && (
                  <span className="block text-xs text-slate-400">{order.shipping_phone}</span>
                )}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </td>
              <td className="px-4 py-3">
                <Badge>{order.status}</Badge>
              </td>
              <td className="px-4 py-3 text-slate-600">{formatINR(order.total_amount)}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
