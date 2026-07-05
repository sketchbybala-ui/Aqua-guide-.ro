import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { PriceTag } from "@/components/ui/PriceTag";
import { WaterTankAnimation } from "./WaterTankAnimation";
import type { Product } from "@/lib/types";

type SpotlightProduct = Pick<Product, "slug" | "name" | "price" | "image_url">;

export function Hero({ spotlightProducts = [] }: { spotlightProducts?: SpotlightProduct[] }) {
  const [first, second] = spotlightProducts;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-100 via-brand-50 to-white">
      {/* decorative background: soft glows + dot texture */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-brand-300/30 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.35]" aria-hidden="true">
          <defs>
            <pattern id="hero-dots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="#93c5fd" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
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
          <WaterTankAnimation className="w-full" />

          {first && (
            <SpotlightCard
              product={first}
              className="absolute -left-4 top-2 -rotate-3 sm:-left-10"
            />
          )}
          {second && (
            <SpotlightCard
              product={second}
              className="absolute -right-2 bottom-6 rotate-3 sm:-right-6"
            />
          )}
        </div>
      </div>

      {/* wave divider flowing into the TrustBar below */}
      <svg
        className="relative block w-full text-brand-900"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 40c120 24 240 24 360 8s240-24 360-8 240 24 360 8 240-24 360-8v40H0Z"
          fill="currentColor"
        />
      </svg>
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
