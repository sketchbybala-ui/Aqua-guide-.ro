import { createClient } from "@/lib/supabase/server";
import { getActiveProductsByCategory } from "@/lib/products";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategorySection } from "@/components/product/CategorySection";

// Reads from Supabase on every request — never statically prerendered.
// Without this, `next build` can try to prerender the page at build time,
// which fails if Supabase env vars aren't set yet (e.g. a first Vercel
// deploy before the project's environment variables are configured).
export const dynamic = "force-dynamic";

// Hand-picked for the front-page photo showcase — a diverse, photogenic
// mix across both categories (all with clean cutout photos).
const SHOWCASE_SLUGS = ["vista-pro", "ss-aqua-ro-mobile-unit", "aqua-touch"];

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: featured }, { data: showcaseRaw }, homeUse, commercial] =
    await Promise.all([
      supabase
        .from("products")
        .select("*, category:categories(name)")
        .eq("is_active", true)
        // Excludes the one product whose photo keeps its original (busy)
        // background — see scripts/image-sources.ts SKIP_CUTOUT — so the
        // homepage only ever leads with clean, consistent product photos.
        .neq("slug", "industrial-containerized-ro-plant")
        .order("price", { ascending: false })
        .limit(4),
      supabase
        .from("products")
        .select("slug, name, price, image_url")
        .in("slug", SHOWCASE_SLUGS),
      getActiveProductsByCategory("home-use", 4),
      getActiveProductsByCategory("commercial", 4),
    ]);

  const showcase = SHOWCASE_SLUGS.map((slug) =>
    showcaseRaw?.find((p) => p.slug === slug)
  ).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <>
      <Hero spotlightProducts={(featured ?? []).slice(0, 2)} />
      <TrustBar />
      <ProductShowcase products={showcase} />
      <FeaturedProducts products={featured ?? []} />
      <CategorySection
        title="Home Use"
        description="Compact RO purifiers designed for kitchens and apartments."
        viewAllHref="/home-use"
        products={homeUse}
      />
      <CategorySection
        title="Commercial Use"
        description="High-capacity RO plants for offices, shops, and industry."
        viewAllHref="/commercial"
        products={commercial}
        tone="tint"
      />
    </>
  );
}
