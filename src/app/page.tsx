import { createClient } from "@/lib/supabase/server";
import { getActiveProductsByCategory } from "@/lib/products";
import { getRatingSummaries } from "@/lib/reviews";
import { Hero } from "@/components/home/Hero";
import { WelcomeBonusBanner } from "@/components/home/WelcomeBonusBanner";
import { StatsBar } from "@/components/home/StatsBar";
import { CategoryButtons } from "@/components/home/CategoryButtons";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { OceanSection } from "@/components/home/OceanSection";
import { CtaBanner } from "@/components/home/CtaBanner";
import { CategorySection } from "@/components/product/CategorySection";

// Reads from Supabase on every request — never statically prerendered.
// Without this, `next build` can try to prerender the page at build time,
// which fails if Supabase env vars aren't set yet (e.g. a first Vercel
// deploy before the project's environment variables are configured).
export const dynamic = "force-dynamic";

// Hand-picked for the front-page photo showcase — a diverse, photogenic
// mix across both categories (all with clean cutout photos).
const SHOWCASE_SLUGS = ["vista-pro", "ss-aqua-ro-mobile-unit", "aqua-touch"];

// A trimmed, transparent (no baked-in white canvas or caption text) cutout
// of the AquaGrand RO+UV unit — see scripts/upload-hero-image.mjs. The
// regular catalog photos have a white canvas + spec caption baked in
// (fine for product cards), which looks wrong blown up large in the hero.
const HERO_IMAGE_URL =
  "https://xdyouevsulbaiuwuumpi.supabase.co/storage/v1/object/public/product-images/products/hero/aquagrand-ro-uv-transparent.png";

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
        .limit(8),
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

  const allIds = [
    ...(featured ?? []).map((p) => p.id),
    ...homeUse.map((p) => p.id),
    ...commercial.map((p) => p.id),
  ];
  const ratings = await getRatingSummaries(allIds);

  return (
    <>
      <WelcomeBonusBanner />
      <Hero heroImageUrl={HERO_IMAGE_URL} />
      <StatsBar />
      <CategoryButtons />
      <ProductShowcase products={showcase} />
      <FeaturedProducts products={featured ?? []} ratings={ratings} />
      <CategorySection
        title="Home Use"
        description="Compact RO purifiers designed for kitchens and apartments."
        viewAllHref="/home-use"
        products={homeUse}
        ratings={ratings}
      />
      <CategorySection
        title="Commercial Use"
        description="High-capacity RO plants for offices, shops, and industry."
        viewAllHref="/commercial"
        products={commercial}
        tone="tint"
        ratings={ratings}
      />
      <WhyChooseUs />
      <OceanSection />
      <CtaBanner />
    </>
  );
}
