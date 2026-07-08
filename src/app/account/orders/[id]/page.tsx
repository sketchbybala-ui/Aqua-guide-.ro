import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { BackButton } from "@/components/ui/BackButton";
import { RefundRequestButton } from "@/components/account/RefundRequestButton";
import { AquaticBackdrop } from "@/components/layout/AquaticBackdrop";

// Reads the logged-in user's session — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id) // RLS already enforces this; explicit for clarity
    .single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
      <AquaticBackdrop />
      <div className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <BackButton fallbackHref="/account/orders" />
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">
            Order #{order.id.slice(0, 8)}
          </h1>
          <Badge>{order.status}</Badge>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <h2 className="mb-2 px-1 text-sm font-semibold text-slate-700">
            Bill Details
          </h2>
          <div className="divide-y divide-slate-100">
            {(items ?? []).map((item) => (
              <div key={item.id} className="flex items-center justify-between px-1 py-3 text-sm">
                <span className="text-slate-700">
                  {item.product_name} &times; {item.quantity}
                </span>
                <span className="font-medium text-slate-900">
                  {formatINR(item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          {order.coupon_code && (
            <div className="flex items-center justify-between border-t border-slate-100 px-1 py-2 text-sm text-green-700">
              <span>
                Coupon <span className="font-mono">{order.coupon_code}</span>
              </span>
              <span>&minus;{formatINR(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-100 px-1 py-3">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="text-lg font-semibold text-slate-900">
              {formatINR(order.total_amount)}
            </span>
          </div>
          <p className="px-1 text-xs text-slate-400">
            Payment: {order.payment_method === "cod" ? "Cash on Delivery" : "Paid Online"}
          </p>
        </div>

        {order.shipping_address && (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 text-sm">
            <h2 className="mb-2 font-semibold text-slate-700">
              Shipping Address
            </h2>
            <p className="text-slate-700">{order.shipping_name}</p>
            <p className="text-slate-500">{order.shipping_phone}</p>
            <p className="mt-1 whitespace-pre-line text-slate-500">
              {order.shipping_address}
            </p>
          </div>
        )}

        {/* Refund: request button (paid + not yet requested), pending notice,
            or a confirmation once the admin has processed it. */}
        <div className="mt-6">
          {order.status === "refunded" ? (
            <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
              This order has been refunded
              {order.refunded_at &&
                ` on ${new Date(order.refunded_at).toLocaleDateString("en-IN", {
                  dateStyle: "long",
                })}`}
              . The amount has been returned to your original payment method.
            </div>
          ) : order.refund_requested_at ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
              Refund requested on{" "}
              {new Date(order.refund_requested_at).toLocaleDateString("en-IN", {
                dateStyle: "long",
              })}
              . Our team is reviewing your request.
            </div>
          ) : order.status === "paid" ? (
            <RefundRequestButton orderId={order.id} />
          ) : null}
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Placed on{" "}
          {new Date(order.created_at).toLocaleDateString("en-IN", {
            dateStyle: "long",
          })}
        </p>
      </div>
    </section>
  );
}
