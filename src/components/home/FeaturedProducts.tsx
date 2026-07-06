import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product, RatingSummary } from "@/lib/types";

type FeaturedProduct = Product & { category?: { name: string } };

export function FeaturedProducts({
  products,
  ratings,
}: {
  products: FeaturedProduct[];
  ratings?: Record<string, RatingSummary>;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
          Our Products
        </span>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
          Pure Water Solutions for Every Need
        </h2>
      </div>
      <ProductGrid products={products} categoryLabel="Featured" ratings={ratings} />
      <div className="mt-10 text-center">
        <Link
          href="/home-use"
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 px-5 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          View All Products &rarr;
        </Link>
      </div>
    </section>
  );
}
