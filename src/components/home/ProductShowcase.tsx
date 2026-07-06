import Image from "next/image";
import Link from "next/link";
import { PriceTag } from "@/components/ui/PriceTag";
import type { Product } from "@/lib/types";

type ShowcaseProduct = Pick<Product, "slug" | "name" | "price" | "image_url">;

const rotations = ["-rotate-3", "rotate-0", "rotate-3"];
const offsets = ["sm:mt-6", "sm:mt-0", "sm:mt-6"];

export function ProductShowcase({ products }: { products: ShowcaseProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-6 flex justify-center">
          <span className="animate-offer-glow inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white">
            🎉 Limited-Time Offer — Free Installation + Extended Warranty on Every Order
          </span>
        </div>

        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            RO Purifiers Built to Last
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Real machines, real photos — every purifier we sell, ready to
            install in your home or business.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {products.map((product, i) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className={`group flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${rotations[i % 3]} ${offsets[i % 3]}`}
            >
              <span
                className="animate-float relative h-56 w-56 shrink-0 sm:h-64 sm:w-64"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {product.image_url && (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="256px"
                    className="object-contain"
                  />
                )}
              </span>
              <span className="mt-4 text-center text-sm font-medium text-slate-800 group-hover:text-brand-600">
                {product.name}
              </span>
              <PriceTag amount={product.price} className="mt-1 text-sm" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
