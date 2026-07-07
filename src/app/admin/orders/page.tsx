import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import type { OrderStatus } from "@/lib/types";

// Reads every user's orders (allowed for admins by the
// orders_admin_select_all RLS policy) — never statically prerendered.
export const dynamic = "force-dynamic";

const STATUS_TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "created", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = status && status !== "all" ? status : "all";

  const supabase = await createClient();

  const [{ data: orders }, { data: allStatuses }] = await Promise.all([
    (() => {
      let query = supabase
        .from("orders")
        .select("id, status, payment_method, total_amount, shipping_name, shipping_phone, razorpay_payment_id, created_at")
        .order("created_at", { ascending: false });
      if (activeStatus !== "all") query = query.eq("status", activeStatus);
      return query;
    })(),
    supabase.from("orders").select("status"),
  ]);

  const counts: Record<string, number> = { all: allStatuses?.length ?? 0 };
  for (const row of allStatuses ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/orders" : `/admin/orders?status=${tab.value}`}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              activeStatus === tab.value
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label} ({counts[tab.value] ?? 0})
          </Link>
        ))}
      </div>

      {!orders || orders.length === 0 ? (
        <p className="text-sm text-slate-500">
          {activeStatus === "all" ? "No orders yet." : `No ${activeStatus} orders.`}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Placed</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                {activeStatus === "paid" && <th className="px-4 py-3">Payment ID</th>}
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
                    {new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {order.payment_method === "cod" ? "COD" : "Online"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge>{order.status}</Badge>
                  </td>
                  {activeStatus === "paid" && (
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {order.razorpay_payment_id || "—"}
                    </td>
                  )}
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
      )}
    </div>
  );
}
