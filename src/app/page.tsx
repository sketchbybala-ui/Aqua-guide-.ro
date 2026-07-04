import { createClient } from "@/lib/supabase/server";
import { getActiveProductsByCategory } from "@/lib/products";
import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategorySection } from "@/components/product/CategorySection";

// Reads from Supabase on every request — never statically prerendered.
// Without this, `next build` can try to prerender the page at build time,
// which fails if Supabase env vars aren't set yet (e.g. a first Vercel
// deploy before the project's environment variables are configured).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: featured }, homeUse, commercial] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(name)")
      .eq("is_active", true)
      .order("price", { ascending: false })
      .limit(4),
    getActiveProductsByCategory("home-use", 4),
    getActiveProductsByCategory("commercial", 4),
  ]);

  return (
    <>
      <Hero />
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
      />
    </>
  );
}
