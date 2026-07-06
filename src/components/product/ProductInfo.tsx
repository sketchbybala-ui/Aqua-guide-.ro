"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/cart-context";
import { PriceTag } from "@/components/ui/PriceTag";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import type { Product, RatingSummary } from "@/lib/types";

export function ProductInfo({
  product,
  categoryLabel,
  rating,
}: {
  product: Product;
  categoryLabel: string;
  rating?: RatingSummary;
}) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  const cartProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image_url: product.image_url,
  };

  return (
    <div className="flex flex-col gap-4">
      <Badge>{categoryLabel}</Badge>
      <h1 className="text-3xl font-semibold text-slate-900">
        {product.name}
      </h1>
      {rating && rating.review_count > 0 && (
        <div className="flex items-center gap-2">
          <StarRating rating={rating.avg_rating} />
          <span className="text-sm text-slate-500">
            {rating.avg_rating} ({rating.review_count} review{rating.review_count === 1 ? "" : "s"})
          </span>
        </div>
      )}
      <PriceTag amount={product.price} className="text-2xl" />
      {product.description && (
        <p className="text-sm leading-relaxed text-slate-600">
          {product.description}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-slate-600 hover:text-brand-600"
            aria-label="Decrease quantity"
          >
            &minus;
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-2 text-slate-600 hover:text-brand-600"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          variant="secondary"
          className="sm:w-48"
          onClick={() => addItem(cartProduct, quantity)}
        >
          Add to Cart
        </Button>
        <Button
          className="sm:w-48"
          onClick={async () => {
            await addItem(cartProduct, quantity);
            router.push("/checkout");
          }}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
