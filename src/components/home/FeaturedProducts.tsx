import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product } from "@/lib/types";

type FeaturedProduct = Product & { category?: { name: string } };

export function FeaturedProducts({
  products,
}: {
  products: FeaturedProduct[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">
          Featured Products
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          A few favorites from our full range.
        </p>
      </div>
      <ProductGrid products={products} categoryLabel="Featured" />
    </section>
  );
}
