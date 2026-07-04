import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";

type GridProduct = Product & { category?: { name: string } };

export function ProductGrid({
  products,
  categoryLabel,
}: {
  products: GridProduct[];
  categoryLabel: string;
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
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryLabel={categoryLabel}
        />
      ))}
    </div>
  );
}
