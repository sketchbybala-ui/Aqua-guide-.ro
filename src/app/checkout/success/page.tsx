import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";
import { SuccessCheck } from "@/components/checkout/SuccessCheck";
import { AquaticBackdrop } from "@/components/layout/AquaticBackdrop";

// Reads from Supabase on every request — never statically prerendered.
export const dynamic = "force-dynamic";

// Next.js 16: searchParams are async.
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;
  const supabase = await createClient();

  const { data: order } = order_id
    ? await supabase.from("orders").select("*").eq("id", order_id).single()
    : { data: null };

  const isCod = order?.payment_method === "cod" && order?.status === "created";
  const isPaid = order?.status === "paid";
  const confirmed = isPaid || isCod;

  const { data: items } = confirmed
    ? await supabase.from("order_items").select("*").eq("order_id", order!.id)
    : { data: null };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
      <AquaticBackdrop />
      <div className="relative mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        {confirmed ? (
          <>
            <SuccessCheck />
            <h1 className="mt-5 text-2xl font-semibold text-slate-900">
              Thank you for your order!
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Order #{order!.id.slice(0, 8)} &middot;{" "}
              {isCod
                ? "please keep the amount ready — you can pay in cash when your purifier is delivered."
                : "a confirmation has been recorded to your account."}
            </p>

            <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 text-left">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">
                Bill Details
              </h2>
              <ul className="divide-y divide-slate-100">
                {(items ?? []).map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-slate-700">
                      {item.product_name} &times; {item.quantity}
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatINR(item.unit_price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              {order!.coupon_code && (
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-green-700">
                  <span>
                    Coupon <span className="font-mono">{order!.coupon_code}</span>
                  </span>
                  <span>&minus;{formatINR(order!.discount_amount)}</span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-lg font-semibold text-slate-900">
                  {formatINR(order!.total_amount)}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Payment: {order!.payment_method === "cod" ? "Cash on Delivery" : "Paid Online"}
              </p>
            </div>

            {order!.shipping_address && (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-6 text-left">
                <h2 className="mb-2 text-sm font-semibold text-slate-700">
                  Shipping Address
                </h2>
                <p className="text-sm text-slate-700">{order!.shipping_name}</p>
                <p className="text-sm text-slate-500">{order!.shipping_phone}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-500">
                  {order!.shipping_address}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-slate-900">
              We couldn&apos;t confirm this order
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              If money was deducted, it will be refunded automatically within a
              few business days, or contact support with your order reference.
            </p>
          </>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <LinkButton href="/account/orders" variant="secondary">
            View Order History
          </LinkButton>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-brand-600"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
