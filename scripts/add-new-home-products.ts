/**
 * One-off: add 6 new Home Use products the user supplied photos for
 * (image/house ro/*, dated 2026-07-06). Same treatment as
 * refresh-home-images.ts — trim any flat border, place large on a white
 * canvas with the shared spec caption — plus an initial crop for the one
 * source that's a full marketing poster rather than an isolated product
 * shot (Nile Aqua Mars).
 *
 * Run: npx tsx --env-file=.env.local scripts/add-new-home-products.ts
 */
import path from "path";
import { readFile } from "fs/promises";
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
const IMAGE_ROOT = path.resolve(process.cwd(), "image", "house ro");
const CANVAS = 1000;
const SPECS = "RO + UV Purification  •  Compact Countertop Design";

type Box = { left: number; top: number; width: number; height: number };

type NewProduct = {
  slug: string;
  name: string;
  price: number;
  description: string;
  file: string;
  box?: Box; // only needed for full-poster sources, to isolate the product
};

const PRODUCTS: NewProduct[] = [
  {
    slug: "aquafresh",
    name: "Aquafresh",
    price: 7000,
    description:
      "A 5-stage RO water purifier — sediment, pre-carbon, post-carbon, RO membrane, and post-carbon polishing — backed by a 100% Pure quality badge for safe, great-tasting drinking water.",
    file: "WhatsApp Image 2026-07-06 at 5.49.40 PM.jpeg",
  },
  {
    slug: "aqua-glory-pro",
    name: "Aqua Glory Pro",
    price: 6000,
    description:
      "A next-generation RO purifier with a sleek black-and-white design and advanced multi-stage filtration technology for consistently pure drinking water.",
    file: "WhatsApp Image 2026-07-06 at 5.49.41 PM.jpeg",
  },
  {
    slug: "aqua-verve",
    name: "Aqua Verve",
    price: 6500,
    description:
      "A vibrant reverse-osmosis purifier delivering 100% pure water, with a compact design that fits easily into any kitchen.",
    file: "WhatsApp Image 2026-07-06 at 5.49.42 PM (1).jpeg",
  },
  {
    slug: "glance",
    name: "Glance",
    price: 8000,
    description:
      "A compact, wall-mountable RO purifier with a sleek modern design — a space-saving option that still delivers full multi-stage purification.",
    file: "WhatsApp Image 2026-07-06 at 5.49.42 PM.jpeg",
  },
  {
    slug: "nile-aqua-mars",
    name: "Nile Aqua Mars",
    price: 7500,
    description:
      "A modern 9-litre detachable-tank RO purifier from Nile, combining sleek styling with generous storage capacity for uninterrupted access to purified water.",
    file: "WhatsApp Image 2026-07-06 at 5.49.43 PM (1).jpeg",
    box: { left: 270, top: 370, width: 390, height: 530 },
  },
  {
    slug: "knl-healthy-drops",
    name: "KNL Healthy Drops",
    price: 4999,
    description:
      "An ISO 9001:2015-certified RO purifier with RO and Eco modes, offering premium-quality purification you can rely on.",
    file: "WhatsApp Image 2026-07-06 at 5.49.43 PM.jpeg",
  },
];

function specSvg(text: string) {
  return Buffer.from(`
    <svg width="${CANVAS}" height="80">
      <text x="50%" y="50" font-family="Arial, sans-serif" font-size="28" font-weight="600"
        fill="#1d4ed8" text-anchor="middle">${text}</text>
    </svg>
  `);
}

function shadowSvg(width: number, y: number) {
  return Buffer.from(`
    <svg width="${CANVAS}" height="${CANVAS}">
      <defs><filter id="b"><feGaussianBlur stdDeviation="16"/></filter></defs>
      <ellipse cx="${CANVAS / 2}" cy="${y}" rx="${width * 0.42}" ry="22"
        fill="black" opacity="0.28" filter="url(#b)"/>
    </svg>
  `);
}

async function buildImage(product: NewProduct): Promise<Buffer> {
  const original = await readFile(path.join(IMAGE_ROOT, product.file));
  const precropped = product.box
    ? await sharp(original).extract(product.box).toBuffer()
    : original;

  let working = sharp(precropped);
  try {
    working = sharp(await sharp(precropped).trim().toBuffer());
  } catch {
    // not trimmable (non-uniform border) — use the precropped image as-is
  }

  const meta = await working.metadata();
  const productW = meta.width ?? CANVAS;
  const productH = meta.height ?? CANVAS;

  const maxW = 900;
  const maxH = 800;
  const scale = Math.min(maxW / productW, maxH / productH, 3);
  const targetW = Math.round(productW * scale);
  const targetH = Math.round(productH * scale);

  const resizedProduct = await working.resize(targetW, targetH).jpeg({ quality: 95 }).toBuffer();

  const left = Math.round((CANVAS - targetW) / 2);
  const top = Math.round(20 + (maxH - targetH) / 2);
  const shadowY = Math.min(top + targetH + 6, CANVAS - 95);

  return sharp({
    create: { width: CANVAS, height: CANVAS, channels: 3, background: "#ffffff" },
  })
    .composite([
      { input: shadowSvg(targetW, shadowY), top: 0, left: 0 },
      { input: resizedProduct, top, left },
      { input: specSvg(SPECS), top: CANVAS - 90, left: 0 },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
}

async function main() {
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "home-use")
    .single();
  if (categoryError || !category) throw new Error("Could not find the home-use category");

  for (const product of PRODUCTS) {
    const buffer = await buildImage(product);

    const storagePath = `products/enhanced/${product.slug}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });
    if (uploadError) throw new Error(`Upload failed for ${product.slug}: ${uploadError.message}`);

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const { error: upsertError } = await supabase.from("products").upsert(
      {
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: category.id,
        image_url: `${publicUrl}?v=${Date.now()}`,
        is_active: true,
      },
      { onConflict: "slug" }
    );
    if (upsertError) throw new Error(`Upsert failed for ${product.slug}: ${upsertError.message}`);

    console.log(`  ✓ ${product.name} (${product.slug})`);
  }

  console.log("Done — 6 new Home Use products added.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
