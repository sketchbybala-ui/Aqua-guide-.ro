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

const METHOD_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "online", label: "Online" },
  { value: "cod", label: "Cash on Delivery" },
];

// Builds an /admin/orders href that keeps whichever filters aren't being
// changed, so status, payment-method, and search all combine.
function filterHref(status: string, method: string, q: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (method !== "all") params.set("method", method);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/admin/orders?${qs}` : "/admin/orders";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; method?: string; q?: string }>;
}) {
  const { status, method, q } = await searchParams;
  const activeStatus = status && status !== "all" ? status : "all";
  const activeMethod = method === "online" || method === "cod" ? method : "all";
  const search = (q ?? "").trim();

  const supabase = await createClient();

  const [{ data: rawOrders }, { data: allOrders }] = await Promise.all([
    (() => {
      let query = supabase
        .from("orders")
        .select("id, status, payment_method, total_amount, shipping_name, shipping_phone, razorpay_payment_id, created_at")
        .order("created_at", { ascending: false });
      if (activeStatus !== "all") query = query.eq("status", activeStatus);
      if (activeMethod !== "all") query = query.eq("payment_method", activeMethod);
      return query;
    })(),
    supabase.from("orders").select("status, payment_method"),
  ]);

  // Search by order id (the short #xxxxxxxx code or a full UUID) or by the
  // customer's name — matched case-insensitively over the filtered set.
  const needle = search.toLowerCase();
  const orders = search
    ? (rawOrders ?? []).filter(
        (o) =>
          o.id.toLowerCase().includes(needle) ||
          (o.shipping_name ?? "").toLowerCase().includes(needle)
      )
    : rawOrders;

  const counts: Record<string, number> = { all: allOrders?.length ?? 0 };
  const methodCounts: Record<string, number> = { all: allOrders?.length ?? 0 };
  for (const row of allOrders ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
    methodCounts[row.payment_method] = (methodCounts[row.payment_method] ?? 0) + 1;
  }

  return (
    <div>
      <form method="get" className="mb-4 flex gap-2">
        <input type="hidden" name="status" value={activeStatus} />
        <input type="hidden" name="method" value={activeMethod} />
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search by order ID or customer name…"
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-100"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Search
        </button>
        {search && (
          <Link
            href={filterHref(activeStatus, activeMethod, "")}
            className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={filterHref(tab.value, activeMethod, search)}
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

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Payment
        </span>
        {METHOD_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={filterHref(activeStatus, tab.value, search)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              activeMethod === tab.value
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label} ({methodCounts[tab.value] ?? 0})
          </Link>
        ))}
      </div>

      {!orders || orders.length === 0 ? (
        <p className="text-sm text-slate-500">
          {search
            ? `No orders match "${search}".`
            : "No orders match this filter."}
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
