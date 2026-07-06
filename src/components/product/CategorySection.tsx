import Link from "next/link";
import { ProductGrid } from "./ProductGrid";
import type { Product, RatingSummary } from "@/lib/types";

export function CategorySection({
  title,
  description,
  viewAllHref,
  products,
  tone = "white",
  ratings,
}: {
  title: string;
  description?: string;
  viewAllHref: string;
  products: Product[];
  tone?: "white" | "tint";
  ratings?: Record<string, RatingSummary>;
}) {
  return (
    <section className={tone === "tint" ? "bg-brand-50" : "bg-white"}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
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
        <ProductGrid products={products} categoryLabel={title} ratings={ratings} />
      </div>
    </section>
  );
}
