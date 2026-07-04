import Link from "next/link";
import { ProductGrid } from "./ProductGrid";
import type { Product } from "@/lib/types";

export function CategorySection({
  title,
  description,
  viewAllHref,
  products,
}: {
  title: string;
  description?: string;
  viewAllHref: string;
  products: Product[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View all &rarr;
        </Link>
      </div>
      <ProductGrid products={products} categoryLabel={title} />
    </section>
  );
}
