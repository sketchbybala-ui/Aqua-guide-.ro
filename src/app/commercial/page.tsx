import type { Metadata } from "next";
import { getActiveProductsByCategory } from "@/lib/products";
import { ProductGrid } from "@/components/product/ProductGrid";

export const metadata: Metadata = {
  title: "Commercial Water Purifiers | Aqua Guide",
};

export default async function CommercialPage() {
  const products = await getActiveProductsByCategory("commercial");

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Commercial Use
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          High-capacity RO plants for offices, shops, and industry.
        </p>
      </div>
      <ProductGrid products={products} categoryLabel="Commercial Use" />
    </section>
  );
}
