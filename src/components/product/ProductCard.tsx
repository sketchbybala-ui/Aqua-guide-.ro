"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { PriceTag } from "@/components/ui/PriceTag";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/lib/types";

type ProductCardData = Product & { category?: { name: string } };

export function ProductCard({
  product,
  categoryLabel,
}: {
  product: ProductCardData;
  categoryLabel: string;
}) {
  const label = product.category?.name ?? categoryLabel;
  const { addItem } = useCart();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square w-full bg-slate-50">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Badge>{label}</Badge>
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-slate-900 hover:text-brand-600"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <PriceTag amount={product.price} />
          <button
            onClick={() =>
              addItem({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
              })
            }
            className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
