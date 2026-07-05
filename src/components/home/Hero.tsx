import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { RoMachineAnimation } from "./RoMachineAnimation";
import type { Product } from "@/lib/types";

type SpotlightProduct = Pick<Product, "slug" | "name" | "price" | "image_url">;

export function Hero({ spotlightProducts = [] }: { spotlightProducts?: SpotlightProduct[] }) {
  const [first, second] = spotlightProducts;

  return (
    <section className="overflow-hidden bg-gradient-to-b from-brand-100 via-brand-50 to-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-700 shadow-sm">
            Pure Water. Healthy Life.
          </span>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Water purifiers built for every home and business
          </h1>
          <p className="max-w-lg text-base text-slate-600">
            From compact RO systems for your kitchen to high-capacity plants
            for commercial use, Aqua Guide helps you find clean drinking
            water solutions you can trust.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/home-use">Shop Home Use</LinkButton>
            <LinkButton href="/commercial" variant="secondary">
              Shop Commercial Use
            </LinkButton>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="absolute inset-0 -z-10 rounded-full bg-brand-200/50 blur-3xl" />
          <RoMachineAnimation className="w-full" />

          {first && (
            <SpotlightCard
              product={first}
              className="absolute -left-4 top-6 -rotate-3 sm:-left-10"
            />
          )}
          {second && (
            <SpotlightCard
              product={second}
              className="absolute -right-2 bottom-16 rotate-3 sm:-right-6"
            />
          )}
        </div>
      </div>
    </section>
  );
}

function SpotlightCard({
  product,
  className = "",
}: {
  product: SpotlightProduct;
  className?: string;
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className={`hidden w-40 items-center gap-3 rounded-xl bg-white p-2.5 shadow-lg ring-1 ring-slate-100 transition-transform hover:-translate-y-1 sm:flex ${className}`}
    >
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-50">
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-slate-700">
          {product.name}
        </span>
        <PriceTag amount={product.price} className="text-xs" />
      </span>
    </Link>
  );
}
