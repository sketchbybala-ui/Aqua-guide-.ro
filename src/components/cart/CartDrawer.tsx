"use client";

import { useCart } from "@/lib/cart/cart-context";
import { CartLineItem } from "./CartLineItem";
import { CartSummary } from "./CartSummary";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, subtotal } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-900/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Your Cart</h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex-1 divide-y divide-slate-100 overflow-y-auto">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Your cart is empty.
            </p>
          ) : (
            items.map((line) => (
              <CartLineItem key={line.product.id} line={line} />
            ))
          )}
        </div>

        {items.length > 0 && (
          <CartSummary subtotal={subtotal} onNavigate={onClose} />
        )}
      </div>
    </div>
  );
}
