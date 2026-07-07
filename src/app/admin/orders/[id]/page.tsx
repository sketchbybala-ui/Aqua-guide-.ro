import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { BackButton } from "@/components/ui/BackButton";
import { OrderActions } from "@/components/admin/OrderActions";

// Reads any user's order (allowed for admins by the orders_admin_select_all
// RLS policy) — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton fallbackHref="/admin/orders" />

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          Order #{order.id.slice(0, 8)}
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {order.payment_method === "cod" ? "Cash on Delivery" : "Paid Online"}
          </span>
          <Badge>{order.status}</Badge>
        </div>
      </div>

      {order.refund_requested_at && order.status === "paid" && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Refund requested</strong> by the customer on{" "}
          {new Date(order.refund_requested_at).toLocaleDateString("en-IN", {
            dateStyle: "long",
          })}
          . Review and use <em>Issue Full Refund</em> below to process it.
        </div>
      )}

      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
        {(items ?? []).map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 text-sm">
            <span className="text-slate-700">
              {item.product_name} &times; {item.quantity}
            </span>
            <span className="font-medium text-slate-900">
              {formatINR(item.unit_price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 p-4">
        <span className="font-semibold text-slate-900">Total</span>
        <span className="text-lg font-semibold text-slate-900">
          {formatINR(order.total_amount)}
        </span>
      </div>

      {order.shipping_address && (
        <div className="mt-4 rounded-2xl border border-slate-100 p-4 text-sm">
          <h3 className="mb-2 font-semibold text-slate-700">Shipping Address</h3>
          <p className="text-slate-700">{order.shipping_name}</p>
          <p className="text-slate-500">{order.shipping_phone}</p>
          <p className="mt-1 whitespace-pre-line text-slate-500">
            {order.shipping_address}
          </p>
        </div>
      )}

      {order.payment_method === "online" && (
        <div className="mt-4 rounded-2xl border border-slate-100 p-4 text-sm text-slate-500">
          <p>
            Razorpay order ID: <span className="text-slate-700">{order.razorpay_order_id || "—"}</span>
          </p>
          <p className="mt-1">
            Razorpay payment ID: <span className="text-slate-700">{order.razorpay_payment_id || "—"}</span>
          </p>
          {order.razorpay_refund_id && (
            <p className="mt-1">
              Refund ID: <span className="text-slate-700">{order.razorpay_refund_id}</span>
              {order.refunded_at &&
                ` (${new Date(order.refunded_at).toLocaleDateString("en-IN", { dateStyle: "medium" })})`}
            </p>
          )}
        </div>
      )}

      <OrderActions order={order} />

      <p className="mt-6 text-xs text-slate-400">
        Placed on{" "}
        {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}
      </p>
    </div>
  );
}
