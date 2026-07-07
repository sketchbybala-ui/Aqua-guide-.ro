import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";

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

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      {isPaid || isCod ? (
        <>
          <h1 className="text-2xl font-semibold text-slate-900">
            Thank you for your order!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Order total: {formatINR(order!.total_amount)}.{" "}
            {isCod
              ? "Please keep the amount ready — you can pay in cash when your purifier is delivered."
              : "A confirmation has been recorded to your account."}
          </p>
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
    </section>
  );
}
