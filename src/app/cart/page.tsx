"use client";

import { useCart } from "@/lib/cart/cart-context";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { LinkButton } from "@/components/ui/Button";
import { BackButton } from "@/components/ui/BackButton";
import { AquaticBackdrop } from "@/components/layout/AquaticBackdrop";

export default function CartPage() {
  const { items, subtotal, loading } = useCart();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
      <AquaticBackdrop />
      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <BackButton fallbackHref="/" />
        <h1 className="font-heading mb-8 text-2xl font-semibold text-slate-900">
          Your Cart
        </h1>

        {loading ? (
          <p className="text-sm text-slate-500">Loading your cart…</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-slate-100 bg-white p-10">
            <p className="text-sm text-slate-500">Your cart is empty.</p>
            <LinkButton href="/home-use">Start Shopping</LinkButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="divide-y divide-slate-100 rounded-2xl bg-white/60 p-2 backdrop-blur-sm lg:col-span-2 lg:p-4">
              {items.map((line) => (
                <CartLineItem key={line.product.id} line={line} />
              ))}
            </div>
            <div className="lg:col-span-1">
              <CartSummary subtotal={subtotal} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
