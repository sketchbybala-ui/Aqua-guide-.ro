"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart/cart-context";
import { formatINR } from "@/lib/format";
import { RazorpayButton } from "@/components/checkout/RazorpayButton";
import { CodButton } from "@/components/checkout/CodButton";
import { CouponInput, type AppliedCoupon } from "@/components/checkout/CouponInput";
import { AddressBook, type Address } from "@/components/account/AddressBook";
import { BackButton } from "@/components/ui/BackButton";
import { AquaticBackdrop } from "@/components/layout/AquaticBackdrop";
import type { PaymentMethod } from "@/lib/types";

export default function CheckoutPage() {
  const { items, subtotal, loading: cartLoading } = useCart();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selected, setSelected] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
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
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
      <AquaticBackdrop />
      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <BackButton fallbackHref="/cart" />
      <h1 className="mb-8 text-2xl font-semibold text-slate-900">Checkout</h1>

      <div className="rounded-2xl border border-slate-100 bg-white p-6">
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

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6">
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
        <div className="mt-4 border-t border-slate-100 pt-4">
          <CouponInput
            applied={appliedCoupon}
            onApplied={setAppliedCoupon}
            onRemoved={() => setAppliedCoupon(null)}
          />
        </div>

        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
          {appliedCoupon && (
            <>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-green-700">
                <span>Discount ({appliedCoupon.code})</span>
                <span>&minus;{formatINR(appliedCoupon.discountAmount)}</span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="text-lg font-semibold text-slate-900">
              {formatINR(appliedCoupon ? appliedCoupon.total : subtotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Payment Method
        </h2>
        <div className="flex flex-col gap-3">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
              paymentMethod === "online"
                ? "border-brand-500 ring-1 ring-brand-100"
                : "border-slate-200"
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              className="mt-1"
              checked={paymentMethod === "online"}
              onChange={() => setPaymentMethod("online")}
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Pay Online
              </span>
              <span className="block text-xs text-slate-500">
                Card, UPI, netbanking or wallet via Razorpay — secure and instant.
              </span>
            </span>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
              paymentMethod === "cod"
                ? "border-brand-500 ring-1 ring-brand-100"
                : "border-slate-200"
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              className="mt-1"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Cash on Delivery
              </span>
              <span className="block text-xs text-slate-500">
                Pay in cash when your purifier is delivered and installed.
              </span>
            </span>
          </label>
        </div>
      </div>

      {paymentMethod === "online" && (
        <p className="mt-6 text-xs text-slate-400">
          Secure payment via Razorpay.
        </p>
      )}

      {!shippingComplete && (
        <p className="mt-4 text-sm text-amber-600">
          Please fill in your name, phone, and delivery address above to
          continue.
        </p>
      )}

      <div className="mt-4">
        {paymentMethod === "online" ? (
          <RazorpayButton
            shippingInfo={{
              name: selected?.full_name ?? "",
              phone: selected?.phone ?? "",
              address: selected?.address_line ?? "",
            }}
            couponCode={appliedCoupon?.code}
            disabled={!shippingComplete}
          />
        ) : (
          <CodButton
            shippingInfo={{
              name: selected?.full_name ?? "",
              phone: selected?.phone ?? "",
              address: selected?.address_line ?? "",
            }}
            couponCode={appliedCoupon?.code}
            disabled={!shippingComplete}
          />
        )}
      </div>
      </div>
    </section>
  );
}
