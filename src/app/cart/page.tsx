"use client";

import { useCart } from "@/lib/cart/cart-context";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { LinkButton } from "@/components/ui/Button";

export default function CartPage() {
  const { items, subtotal, loading } = useCart();

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold text-slate-900">
        Your Cart
      </h1>

      {loading ? (
        <p className="text-sm text-slate-500">Loading your cart…</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-slate-100 p-10">
          <p className="text-sm text-slate-500">Your cart is empty.</p>
          <LinkButton href="/home-use">Start Shopping</LinkButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="divide-y divide-slate-100 lg:col-span-2">
            {items.map((line) => (
              <CartLineItem key={line.product.id} line={line} />
            ))}
          </div>
          <div className="lg:col-span-1">
            <CartSummary subtotal={subtotal} />
          </div>
        </div>
      )}
    </section>
  );
}
