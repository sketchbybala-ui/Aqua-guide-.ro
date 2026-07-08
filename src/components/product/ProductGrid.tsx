import { ProductCard } from "./ProductCard";
import type { Product, RatingSummary } from "@/lib/types";

type GridProduct = Product & { category?: { name: string } };

export function ProductGrid({
  products,
  categoryLabel,
  ratings,
}: {
  products: GridProduct[];
  categoryLabel: string;
  ratings?: Record<string, RatingSummary>;
}) {
  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">
        No products yet in this category.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }}
        >
          <ProductCard
            product={product}
            categoryLabel={categoryLabel}
            rating={ratings?.[product.id]}
          />
        </div>
      ))}
    </div>
  );
}
