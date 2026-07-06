"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart/cart-context";
import { formatINR } from "@/lib/format";
import { RazorpayButton } from "@/components/checkout/RazorpayButton";
import { AddressBook, type Address } from "@/components/account/AddressBook";
import { BackButton } from "@/components/ui/BackButton";

export default function CheckoutPage() {
  const { items, subtotal, loading: cartLoading } = useCart();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selected, setSelected] = useState<Address | null>(null);
  const [profilePrefill, setProfilePrefill] = useState<{ full_name?: string; phone?: string }>({});
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/login?next=/checkout");
        return;
      }

      // Used only to prefill the "add new address" form the first time.
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", data.user.id)
        .single();

      setProfilePrefill({ full_name: profile?.full_name ?? undefined, phone: profile?.phone ?? undefined });
      setCheckingAuth(false);
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

  const shippingComplete = Boolean(selected);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <BackButton fallbackHref="/cart" />
      <h1 className="mb-8 text-2xl font-semibold text-slate-900">Checkout</h1>

      <div className="rounded-2xl border border-slate-100 p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Shipping Address
        </h2>
        <AddressBook
          selectable
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          prefill={profilePrefill}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 p-6">
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

      {!shippingComplete && (
        <p className="mt-4 text-sm text-amber-600">
          Please fill in your name, phone, and delivery address above to
          continue.
        </p>
      )}

      <div className="mt-4">
        <RazorpayButton
          shippingInfo={{
            name: selected?.full_name ?? "",
            phone: selected?.phone ?? "",
            address: selected?.address_line ?? "",
          }}
          disabled={!shippingComplete}
        />
      </div>
    </section>
  );
}
