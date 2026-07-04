/**
 * One-off seed script: uploads the source catalog images from image/ to the
 * `product-images` Supabase Storage bucket, then upserts all 22 products.
 *
 * Run after creating your Supabase project and running supabase/schema.sql:
 *   npx tsx --env-file=.env.local scripts/seed-products.ts
 */
import { readFile } from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with --env-file=.env.local"
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const BUCKET = "product-images";
const IMAGE_ROOT = path.resolve(process.cwd(), "image");

async function uploadImage(localPath: string, storagePath: string) {
  const bytes = await readFile(path.join(IMAGE_ROOT, localPath));
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType: "image/jpeg", upsert: true });

  if (error) throw new Error(`Upload failed for ${localPath}: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

type SeedProduct = {
  slug: string;
  name: string;
  price: number;
  description: string;
  categorySlug: "home-use" | "commercial";
  imageUrl: string; // resolved public URL, filled in below
};

async function main() {
  console.log("Ensuring Storage bucket exists...");
  const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
  });
  if (bucketError && !bucketError.message.includes("already exists")) {
    throw bucketError;
  }

  console.log("Uploading shared placeholder images...");
  const homeUsePosterA = await uploadImage(
    "house ro/WhatsApp Image 2026-07-02 at 3.47.12 PM.jpeg",
    "placeholders/home-use-poster-a.jpg"
  );
  const homeUsePosterB = await uploadImage(
    "house ro/catlog2.jpeg",
    "placeholders/home-use-poster-b.jpg"
  );

  console.log("Uploading individual commercial product images...");
  const commercialImages = {
    industrialContainer: await uploadImage(
      "commersial ro/WhatsApp Image 2026-07-03 at 4.27.26 PM.jpeg",
      "products/commercial/industrial-containerized-ro-plant.jpg"
    ),
    ozean: await uploadImage(
      "commersial ro/WhatsApp Image 2026-07-03 at 4.27.26 PM (1).jpeg",
      "products/commercial/ozean-commercial-ro-plant.jpg"
    ),
    twinTank: await uploadImage(
      "commersial ro/WhatsApp Image 2026-07-03 at 4.27.27 PM.jpeg",
      "products/commercial/twin-tank-commercial-ro-system.jpg"
    ),
    ssAquaRo: await uploadImage(
      "commersial ro/WhatsApp Image 2026-07-03 at 4.27.27 PM (1).jpeg",
      "products/commercial/ss-aqua-ro-mobile-unit.jpg"
    ),
    skidContainer: await uploadImage(
      "commersial ro/WhatsApp Image 2026-07-03 at 4.27.27 PM (2).jpeg",
      "products/commercial/heavy-duty-skid-ro-container-plant.jpg"
    ),
  };

  const products: SeedProduct[] = [
    // Home Use — Poster A ("Pure Solutions")
    { slug: "lexpure-vedic", name: "LexPure Vedic", price: 15000, categorySlug: "home-use", imageUrl: homeUsePosterA, description: "A reliable RO water purifier for everyday home use." },
    { slug: "vista-pro", name: "Vista Pro", price: 18000, categorySlug: "home-use", imageUrl: homeUsePosterA, description: "Advanced multi-stage purification for modern kitchens." },
    { slug: "3-stage-ro-system-blue", name: "3 Stage RO System (Blue)", price: 16000, categorySlug: "home-use", imageUrl: homeUsePosterA, description: "Compact 3-stage reverse osmosis system." },
    { slug: "3-stage-ro-system-white", name: "3 Stage RO System (White)", price: 9000, categorySlug: "home-use", imageUrl: homeUsePosterA, description: "Budget-friendly 3-stage reverse osmosis system." },
    { slug: "aqua-glory", name: "Aqua Glory", price: 7000, categorySlug: "home-use", imageUrl: homeUsePosterA, description: "Entry-level RO purifier with reliable daily performance." },
    { slug: "aqua-cyclone", name: "Aqua Cyclone", price: 12000, categorySlug: "home-use", imageUrl: homeUsePosterA, description: "Alkaline RO purifier for enhanced mineral water." },
    { slug: "aquagrand-ro-uv", name: "AquaGrand RO + UV", price: 14000, categorySlug: "home-use", imageUrl: homeUsePosterA, description: "Combined RO and UV purification for extra safety." },
    { slug: "aqua-touch", name: "Aqua Touch", price: 9000, categorySlug: "home-use", imageUrl: homeUsePosterA, description: "Sleek, touch-friendly RO purifier for compact kitchens." },
    { slug: "aqua-roma", name: "Aqua Roma", price: 8000, categorySlug: "home-use", imageUrl: homeUsePosterA, description: "Stylish RO purifier available in multiple colors." },
    { slug: "neptune-aps", name: "Neptune (APS)", price: 10000, categorySlug: "home-use", imageUrl: homeUsePosterA, description: "Dependable mid-range RO purifier for families." },
    { slug: "aqua-innovica", name: "Aqua Innovica", price: 20000, categorySlug: "home-use", imageUrl: homeUsePosterA, description: "Premium RO purifier with advanced filtration technology." },

    // Home Use — Poster B
    { slug: "nile-aqua-innovica-lavish", name: "Nile Aqua Innovica – Lavish", price: 12000, categorySlug: "home-use", imageUrl: homeUsePosterB, description: "Zinc, copper & alkaline enrichment with LED indicators." },
    { slug: "clean-water-aqua-xl-silver", name: "Clean Water Aqua XL – Silver", price: 10000, categorySlug: "home-use", imageUrl: homeUsePosterB, description: "RO + TDS control with a digital LED display." },
    { slug: "nile-aqua-v5", name: "Nile Aqua V5", price: 9500, categorySlug: "home-use", imageUrl: homeUsePosterB, description: "Premium, perfectly sized alkaline RO purifier." },
    { slug: "clean-water-hi-flo", name: "Clean Water Hi-Flo", price: 9000, categorySlug: "home-use", imageUrl: homeUsePosterB, description: "Advanced technology with durable contours." },
    { slug: "aqua-grid-teal", name: "Aqua Grid – Teal", price: 8000, categorySlug: "home-use", imageUrl: homeUsePosterB, description: "10L detachable storage tank with smart LED blinking." },
    { slug: "aqua-grid-charcoal", name: "Aqua Grid – Charcoal", price: 8000, categorySlug: "home-use", imageUrl: homeUsePosterB, description: "10L detachable storage tank with smart LED blinking, in charcoal." },

    // Commercial Use
    { slug: "industrial-containerized-ro-plant", name: "Industrial Containerized RO Plant", price: 3500000, categorySlug: "commercial", imageUrl: commercialImages.industrialContainer, description: "Large-scale containerized reverse osmosis plant for industrial water treatment." },
    { slug: "ozean-commercial-ro-plant", name: "Ozean Commercial RO Plant (3-Stage)", price: 50000, categorySlug: "commercial", imageUrl: commercialImages.ozean, description: "3-stage commercial reverse osmosis system for shops and small businesses." },
    { slug: "twin-tank-commercial-ro-system", name: "Twin-Tank Commercial RO System", price: 150000, categorySlug: "commercial", imageUrl: commercialImages.twinTank, description: "Twin-tank RO and softener system for medium commercial water demand." },
    { slug: "ss-aqua-ro-mobile-unit", name: "SS Aqua & RO Mobile Unit", price: 200000, categorySlug: "commercial", imageUrl: commercialImages.ssAquaRo, description: "Mobile, wheel-mounted stainless steel RO unit for flexible deployment." },
    { slug: "heavy-duty-skid-ro-container-plant", name: "Heavy-Duty Skid RO Container Plant", price: 1500000, categorySlug: "commercial", imageUrl: commercialImages.skidContainer, description: "Skid-mounted, high-capacity RO plant for large commercial and industrial sites." },
  ];

  console.log("Fetching category ids...");
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, slug");
  if (categoriesError) throw categoriesError;

  const categoryIdBySlug = Object.fromEntries(
    (categories ?? []).map((c) => [c.slug, c.id])
  );

  console.log(`Upserting ${products.length} products...`);
  for (const product of products) {
    const categoryId = categoryIdBySlug[product.categorySlug];
    if (!categoryId) {
      throw new Error(
        `Category "${product.categorySlug}" not found — did you run supabase/schema.sql first?`
      );
    }

    const { error } = await supabase.from("products").upsert(
      {
        slug: product.slug,
        name: product.name,
        price: product.price,
        description: product.description,
        category_id: categoryId,
        image_url: product.imageUrl,
        is_active: true,
      },
      { onConflict: "slug" }
    );

    if (error) throw new Error(`Failed to upsert ${product.slug}: ${error.message}`);
    console.log(`  ✓ ${product.name}`);
  }

  console.log("Done seeding Aqua Guide catalog.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
