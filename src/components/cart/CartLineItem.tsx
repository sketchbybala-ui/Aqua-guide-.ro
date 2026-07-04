"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart, type CartLine } from "@/lib/cart/cart-context";
import { formatINR } from "@/lib/format";

export function CartLineItem({ line }: { line: CartLine }) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = line;

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={`/products/${product.slug}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-50"
      >
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-medium text-slate-900 hover:text-brand-600"
          >
            {product.name}
          </Link>
          <button
            onClick={() => removeItem(product.id)}
            aria-label="Remove item"
            className="text-xs text-slate-400 hover:text-red-500"
          >
            Remove
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="px-2.5 py-1 text-slate-600 hover:text-brand-600"
              aria-label="Decrease quantity"
            >
              &minus;
            </button>
            <span className="w-6 text-center text-sm">{quantity}</span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="px-2.5 py-1 text-slate-600 hover:text-brand-600"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <span className="text-sm font-semibold text-slate-900">
            {formatINR(product.price * quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
