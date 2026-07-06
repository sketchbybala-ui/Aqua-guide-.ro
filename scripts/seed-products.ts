/**
 * One-off seed script: uploads the source catalog images from image/ to the
 * `product-images` Supabase Storage bucket, then upserts all 22 products.
 *
 * The two Home Use "poster" images each contain several products side by
 * side, so each product's individual tile is cropped out (coordinates
 * calibrated by hand against the exact source files) rather than reusing
 * the whole poster as every product's photo.
 *
 * Run after creating your Supabase project and running supabase/schema.sql:
 *   npx tsx --env-file=.env.local scripts/seed-products.ts
 */
import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
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

type Box = { left: number; top: number; width: number; height: number };

async function uploadCrop(localPath: string, box: Box, storagePath: string) {
  const buffer = await sharp(path.join(IMAGE_ROOT, localPath))
    .extract(box)
    .jpeg({ quality: 90 })
    .toBuffer();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });

  if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

// Poster A: "house ro/WhatsApp Image 2026-07-02 at 3.47.12 PM.jpeg", 1536x1024,
// a 6-column row of 6 products followed by a row of 5.
const POSTER_A = "house ro/WhatsApp Image 2026-07-02 at 3.47.12 PM.jpeg";
const posterARow1 = (col: number): Box => ({ left: col * 256, top: 140, width: 256, height: 350 });
const posterARow2 = (col: number): Box => ({ left: col * 288, top: 490, width: 256, height: 420 });

// Poster B: "house ro/catlog2.jpeg", 768x1376, a 2-column x 3-row grid.
const POSTER_B = "house ro/catlog2.jpeg";
const posterBCell = (col: number, row: number): Box => ({
  left: col * 384,
  top: row === 2 ? 918 : row * 459,
  width: 384,
  height: row === 2 ? 458 : 459,
});

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

  console.log("Cropping and uploading individual Home Use product photos...");
  const homeUse = {
    lexpureVedic: await uploadCrop(POSTER_A, posterARow1(0), "products/home-use/lexpure-vedic.jpg"),
    vistaPro: await uploadCrop(POSTER_A, posterARow1(1), "products/home-use/vista-pro.jpg"),
    roBlue: await uploadCrop(POSTER_A, posterARow1(2), "products/home-use/3-stage-ro-system-blue.jpg"),
    roWhite: await uploadCrop(POSTER_A, posterARow1(3), "products/home-use/3-stage-ro-system-white.jpg"),
    aquaGlory: await uploadCrop(POSTER_A, posterARow1(4), "products/home-use/aqua-glory.jpg"),
    aquaCyclone: await uploadCrop(POSTER_A, posterARow1(5), "products/home-use/aqua-cyclone.jpg"),
    aquagrand: await uploadCrop(POSTER_A, posterARow2(0), "products/home-use/aquagrand-ro-uv.jpg"),
    aquaTouch: await uploadCrop(POSTER_A, posterARow2(1), "products/home-use/aqua-touch.jpg"),
    aquaRoma: await uploadCrop(POSTER_A, posterARow2(2), "products/home-use/aqua-roma.jpg"),
    neptune: await uploadCrop(POSTER_A, posterARow2(3), "products/home-use/neptune-aps.jpg"),
    aquaInnovica: await uploadCrop(POSTER_A, posterARow2(4), "products/home-use/aqua-innovica.jpg"),

    nileInnovicaLavish: await uploadCrop(POSTER_B, posterBCell(0, 0), "products/home-use/nile-aqua-innovica-lavish.jpg"),
    cleanWaterXl: await uploadCrop(POSTER_B, posterBCell(1, 0), "products/home-use/clean-water-aqua-xl-silver.jpg"),
    nileV5: await uploadCrop(POSTER_B, posterBCell(0, 1), "products/home-use/nile-aqua-v5.jpg"),
    cleanWaterHiFlo: await uploadCrop(POSTER_B, posterBCell(1, 1), "products/home-use/clean-water-hi-flo.jpg"),
    aquaGridTeal: await uploadCrop(POSTER_B, posterBCell(0, 2), "products/home-use/aqua-grid-teal.jpg"),
    aquaGridCharcoal: await uploadCrop(POSTER_B, posterBCell(1, 2), "products/home-use/aqua-grid-charcoal.jpg"),
  };

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
    { slug: "lexpure-vedic", name: "LexPure Vedic", price: 15000, categorySlug: "home-use", imageUrl: homeUse.lexpureVedic, description: "A 3-stage alkaline RO purifier with a built-in LED display and a mineral cartridge that adds essential minerals back for naturally better-tasting water, finished with an elegant traditional-pattern design." },
    { slug: "vista-pro", name: "Vista Pro", price: 18000, categorySlug: "home-use", imageUrl: homeUse.vistaPro, description: "A premium multi-stage RO purifier with a digital LED display and copper enrichment, built for consistent, great-tasting water in modern kitchens." },
    { slug: "3-stage-ro-system-blue", name: "3 Stage RO System (Blue)", price: 16000, categorySlug: "home-use", imageUrl: homeUse.roBlue, description: "A compact 3-stage reverse osmosis system with sediment, carbon, and RO membrane filtration plus a UV sterilizer stage for extra protection against bacteria and viruses." },
    { slug: "3-stage-ro-system-white", name: "3 Stage RO System (White)", price: 9000, categorySlug: "home-use", imageUrl: homeUse.roWhite, description: "A budget-friendly 3-stage reverse osmosis system covering sediment, carbon, and RO membrane filtration — reliable everyday purification without the extra frills." },
    { slug: "aqua-glory", name: "Aqua Glory", price: 7000, categorySlug: "home-use", imageUrl: homeUse.aquaGlory, description: "An entry-level RO purifier built for reliable daily performance, with straightforward controls and consistent purification for everyday drinking water." },
    { slug: "aqua-cyclone", name: "Aqua Cyclone", price: 12000, categorySlug: "home-use", imageUrl: homeUse.aquaCyclone, description: "An alkaline RO purifier with a transparent tank so you can see the multi-stage filtration at work, enriching water with minerals for a smoother, alkaline taste." },
    { slug: "aquagrand-ro-uv", name: "AquaGrand RO + UV", price: 14000, categorySlug: "home-use", imageUrl: homeUse.aquagrand, description: "Combines RO, UV, and TDS-controller purification in one unit, with an activated carbon filter and a pre-filter-change alarm so you always know when servicing is due." },
    { slug: "aqua-touch", name: "Aqua Touch", price: 9000, categorySlug: "home-use", imageUrl: homeUse.aquaTouch, description: "A sleek RO purifier with a detachable, washable storage tank, designed for compact kitchens that still want full multi-stage purification." },
    { slug: "aqua-roma", name: "Aqua Roma", price: 8000, categorySlug: "home-use", imageUrl: homeUse.aquaRoma, description: "A stylish RO purifier built with 100% food-grade ABS plastic, available in multiple colors, delivering refreshing, purified water for the whole family." },
    { slug: "neptune-aps", name: "Neptune (APS)", price: 10000, categorySlug: "home-use", imageUrl: homeUse.neptune, description: "A dependable mid-range RO purifier trusted for consistent 100% pure water — a solid, no-fuss choice for everyday family use." },
    { slug: "aqua-innovica", name: "Aqua Innovica", price: 20000, categorySlug: "home-use", imageUrl: homeUse.aquaInnovica, description: "A premium RO purifier with 3-stage zinc, copper, and alkaline mineral enrichment plus a dust-proof design, for noticeably better-tasting purified water." },

    // Home Use — Poster B
    { slug: "nile-aqua-innovica-lavish", name: "Nile Aqua Innovica – Lavish", price: 12000, categorySlug: "home-use", imageUrl: homeUse.nileInnovicaLavish, description: "The Lavish edition of our Innovica line, with the same zinc, copper, and alkaline mineral enrichment in a distinctive finish, plus clear LED status indicators." },
    { slug: "clean-water-aqua-xl-silver", name: "Clean Water Aqua XL – Silver", price: 10000, categorySlug: "home-use", imageUrl: homeUse.cleanWaterXl, description: "An RO + TDS-control purifier with a digital LED display and 3-stage zinc, copper, and alkaline enrichment, built for households that want precise control over water quality." },
    { slug: "nile-aqua-v5", name: "Nile Aqua V5", price: 9500, categorySlug: "home-use", imageUrl: homeUse.nileV5, description: "A premium, perfectly sized alkaline RO purifier with next-generation filtration technology, compact enough for any kitchen counter." },
    { slug: "clean-water-hi-flo", name: "Clean Water Hi-Flo", price: 9000, categorySlug: "home-use", imageUrl: homeUse.cleanWaterHiFlo, description: "Built around a durable triple-filter cartridge design, the Hi-Flo delivers dependable, high-flow purification with a modern, wave-contoured housing." },
    { slug: "aqua-grid-teal", name: "Aqua Grid – Teal", price: 8000, categorySlug: "home-use", imageUrl: homeUse.aquaGridTeal, description: "A 10L detachable storage tank purifier with smart LED indicators and a premium alkaline mineral-enrichment stage, in a striking teal finish." },
    { slug: "aqua-grid-charcoal", name: "Aqua Grid – Charcoal", price: 8000, categorySlug: "home-use", imageUrl: homeUse.aquaGridCharcoal, description: "The same 10L detachable-tank, alkaline-enrichment purifier as the Aqua Grid Teal, in a sleek charcoal finish for a more understated look." },

    // Commercial Use
    { slug: "industrial-containerized-ro-plant", name: "Industrial Containerized RO Plant", price: 3500000, categorySlug: "commercial", imageUrl: commercialImages.industrialContainer, description: "A large-scale, fully containerized reverse osmosis plant engineered for high-volume industrial water treatment, built for continuous, heavy-duty operation." },
    { slug: "ozean-commercial-ro-plant", name: "Ozean Commercial RO Plant (3-Stage)", price: 50000, categorySlug: "commercial", imageUrl: commercialImages.ozean, description: "A 3-stage commercial reverse osmosis system sized for shops and small businesses that need reliable purified water throughout the day." },
    { slug: "twin-tank-commercial-ro-system", name: "Twin-Tank Commercial RO System", price: 150000, categorySlug: "commercial", imageUrl: commercialImages.twinTank, description: "A twin-tank RO and water-softener system built for medium-scale commercial water demand, balancing purification capacity with continuous supply." },
    { slug: "ss-aqua-ro-mobile-unit", name: "SS Aqua & RO Mobile Unit", price: 200000, categorySlug: "commercial", imageUrl: commercialImages.ssAquaRo, description: "A wheel-mounted, stainless-steel RO unit built for flexible deployment — move it wherever purified water is needed on-site." },
    { slug: "heavy-duty-skid-ro-container-plant", name: "Heavy-Duty Skid RO Container Plant", price: 1500000, categorySlug: "commercial", imageUrl: commercialImages.skidContainer, description: "A skid-mounted, high-capacity RO plant engineered for large commercial and industrial sites with continuous, heavy-duty water treatment needs." },
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
