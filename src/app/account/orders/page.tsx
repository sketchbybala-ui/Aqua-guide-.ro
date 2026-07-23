import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { BackButton } from "@/components/ui/BackButton";

// Reads the logged-in user's session — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function OrderHistoryPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_amount, currency, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <BackButton fallbackHref="/account" />
      <h1 className="font-heading mb-8 text-2xl font-semibold text-slate-900">
        Order History
      </h1>

      {!orders || orders.length === 0 ? (
        <p className="text-sm text-slate-500">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between p-5 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Order #{order.id.slice(0, 8)}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    dateStyle: "medium",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge>{order.status}</Badge>
                <span className="text-sm font-semibold text-slate-900">
                  {formatINR(order.total_amount)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
