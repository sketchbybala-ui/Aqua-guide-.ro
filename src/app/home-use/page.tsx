import type { Metadata } from "next";
import { getActiveProductsByCategory } from "@/lib/products";
import { getRatingSummaries } from "@/lib/reviews";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BackButton } from "@/components/ui/BackButton";

export const metadata: Metadata = {
  title: "Home Use Water Purifiers | Aqua Guide",
};

// Reads from Supabase on every request — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function HomeUsePage() {
  const products = await getActiveProductsByCategory("home-use");
  const ratings = await getRatingSummaries(products.map((p) => p.id));

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <BackButton fallbackHref="/" />
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Home Use</h1>
        <p className="mt-1 text-sm text-slate-500">
          Compact RO purifiers designed for kitchens and apartments.
        </p>
      </div>
      <ProductGrid products={products} categoryLabel="Home Use" ratings={ratings} />
    </section>
  );
}
