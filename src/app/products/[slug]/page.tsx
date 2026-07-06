import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/products";
import { getRatingSummaries, getReviewsForProduct } from "@/lib/reviews";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ReviewForm } from "@/components/product/ReviewForm";
import { ReviewList } from "@/components/product/ReviewList";
import { BackButton } from "@/components/ui/BackButton";

// Reads from Supabase on every request — never statically prerendered.
export const dynamic = "force-dynamic";

// Next.js 16: dynamic route `params` are async.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} | Aqua Guide` : "Aqua Guide" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [reviews, ratingSummaries] = await Promise.all([
    getReviewsForProduct(product.id),
    getRatingSummaries([product.id]),
  ]);
  const rating = ratingSummaries[product.id];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <BackButton fallbackHref={`/${product.category?.slug ?? "home-use"}`} />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery imageUrl={product.image_url} alt={product.name} />
        <ProductInfo
          product={product}
          categoryLabel={product.category?.name ?? ""}
          rating={rating}
        />
      </div>

      <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Customer Reviews
          </h2>
          <ReviewList reviews={reviews} />
        </div>
        <div>
          <ReviewForm productId={product.id} productSlug={product.slug} />
        </div>
      </div>
    </section>
  );
}
