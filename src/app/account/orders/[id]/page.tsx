import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { BackButton } from "@/components/ui/BackButton";

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
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <BackButton fallbackHref="/account/orders" />
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Order #{order.id.slice(0, 8)}
        </h1>
        <Badge>{order.status}</Badge>
      </div>

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

      <p className="mt-6 text-xs text-slate-400">
        Placed on{" "}
        {new Date(order.created_at).toLocaleDateString("en-IN", {
          dateStyle: "long",
        })}
      </p>
    </section>
  );
}
