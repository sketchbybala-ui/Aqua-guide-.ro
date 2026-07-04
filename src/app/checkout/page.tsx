"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart/cart-context";
import { formatINR } from "@/lib/format";
import { RazorpayButton } from "@/components/checkout/RazorpayButton";

export default function CheckoutPage() {
  const { items, subtotal, loading: cartLoading } = useCart();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login?next=/checkout");
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router]);

  if (checkingAuth || cartLoading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-sm text-slate-500">Loading checkout…</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-sm text-slate-500">
          Your cart is empty — add a product before checking out.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold text-slate-900">Checkout</h1>

      <div className="rounded-2xl border border-slate-100 p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Order Summary
        </h2>
        <ul className="divide-y divide-slate-100">
          {items.map((line) => (
            <li
              key={line.product.id}
              className="flex items-center justify-between py-3 text-sm"
            >
              <span className="text-slate-700">
                {line.product.name} &times; {line.quantity}
              </span>
              <span className="font-medium text-slate-900">
                {formatINR(line.product.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="font-semibold text-slate-900">Total</span>
          <span className="text-lg font-semibold text-slate-900">
            {formatINR(subtotal)}
          </span>
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Test mode — no real payment will be captured. Use Razorpay&apos;s
        published test card numbers at checkout.
      </p>

      <div className="mt-4">
        <RazorpayButton />
      </div>
    </section>
  );
}
