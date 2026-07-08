import type { Metadata } from "next";
import { getActiveProductsByCategory } from "@/lib/products";
import { getRatingSummaries } from "@/lib/reviews";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BackButton } from "@/components/ui/BackButton";
import { AquaticBackdrop } from "@/components/layout/AquaticBackdrop";

export const metadata: Metadata = {
  title: "Commercial Water Purifiers | Aqua Guide",
};

// Reads from Supabase on every request — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function CommercialPage() {
  const products = await getActiveProductsByCategory("commercial");
  const ratings = await getRatingSummaries(products.map((p) => p.id));

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white">
      <AquaticBackdrop />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <BackButton fallbackHref="/" />
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Commercial Use
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            High-capacity RO plants for offices, shops, and industry.
          </p>
        </div>
        <ProductGrid products={products} categoryLabel="Commercial Use" ratings={ratings} />
      </div>
    </section>
  );
}
