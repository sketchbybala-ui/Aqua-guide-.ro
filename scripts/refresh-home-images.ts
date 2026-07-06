/**
 * One-off: replace the Home Use product photos with the new individual
 * shots the user added to `image/house ro/` (each product now has its own
 * dedicated photo instead of being cropped out of a shared poster).
 *
 * These new source photos are already clean, tightly-shot studio photography
 * (unlike the old poster crops), so this just trims any flat background
 * border, places the product large on a white canvas, and adds the same
 * spec-caption band the rest of the catalog uses — no ML background removal
 * needed this time.
 *
 * Run: npx tsx --env-file=.env.local scripts/refresh-home-images.ts
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

const PHOTOS: Record<string, string> = {
  "lexpure-vedic": "WhatsApp Image 2026-07-05 at 12.58.34 AM (2).jpeg",
  "vista-pro": "WhatsApp Image 2026-07-05 at 12.58.34 AM (3).jpeg",
  "3-stage-ro-system-blue": "WhatsApp Image 2026-07-05 at 12.58.37 AM (1).jpeg",
  "3-stage-ro-system-white": "WhatsApp Image 2026-07-05 at 12.58.37 AM (1).jpeg",
  "aqua-glory": "WhatsApp Image 2026-07-05 at 12.58.33 AM (1).jpeg",
  "aqua-cyclone": "WhatsApp Image 2026-07-05 at 12.58.35 AM.jpeg",
  "aquagrand-ro-uv": "WhatsApp Image 2026-07-05 at 12.58.37 AM (2).jpeg",
  "aqua-touch": "WhatsApp Image 2026-07-05 at 12.58.37 AM.jpeg",
  "aqua-roma": "WhatsApp Image 2026-07-05 at 12.58.35 AM (2).jpeg",
  "neptune-aps": "WhatsApp Image 2026-07-05 at 12.58.36 AM (3).jpeg",
  "aqua-innovica": "WhatsApp Image 2026-07-05 at 12.58.34 AM (1).jpeg",
  "nile-aqua-innovica-lavish": "WhatsApp Image 2026-07-05 at 12.58.35 AM (3).jpeg",
  "clean-water-aqua-xl-silver": "WhatsApp Image 2026-07-05 at 12.58.35 AM (1).jpeg",
  "nile-aqua-v5": "WhatsApp Image 2026-07-05 at 12.58.36 AM (1).jpeg",
  "clean-water-hi-flo": "WhatsApp Image 2026-07-05 at 12.58.36 AM.jpeg",
  "aqua-grid-teal": "WhatsApp Image 2026-07-05 at 12.58.36 AM (2).jpeg",
  "aqua-grid-charcoal": "WhatsApp Image 2026-07-05 at 12.58.36 AM (2).jpeg",
};

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

async function buildImage(slug: string, filename: string): Promise<Buffer> {
  const original = await readFile(path.join(IMAGE_ROOT, filename));

  // Trim a flat background border if there is one; harmless no-op photos
  // with a busy/lifestyle background (trim just won't remove much).
  let working = sharp(original);
  try {
    working = sharp(await sharp(original).trim().toBuffer());
  } catch {
    // not trimmable (non-uniform border) — use the original as-is
  }

  const meta = await working.metadata();
  const productW = meta.width ?? CANVAS;
  const productH = meta.height ?? CANVAS;

  const maxW = 900;
  const maxH = 800;
  // Several of the new source photos are small (down to 393x500) — allow
  // upscaling (capped so tiny sources don't get blown up into mush) instead
  // of the old cap-at-1 behavior, which left small photos looking tiny and
  // adrift on the canvas.
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
  for (const [slug, filename] of Object.entries(PHOTOS)) {
    const buffer = await buildImage(slug, filename);

    const storagePath = `products/enhanced/${slug}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });
    if (uploadError) throw new Error(`Upload failed for ${slug}: ${uploadError.message}`);

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const { error: updateError } = await supabase
      .from("products")
      .update({ image_url: `${publicUrl}?v=${Date.now()}` })
      .eq("slug", slug);
    if (updateError) throw new Error(`DB update failed for ${slug}: ${updateError.message}`);

    console.log(`  ✓ ${slug} (${filename})`);
  }

  console.log("Done — Home Use product photos refreshed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
