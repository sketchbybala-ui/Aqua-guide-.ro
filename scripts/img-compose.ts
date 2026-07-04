/**
 * Phase 3/3 of the image-enhancement pipeline: places each cutout on a
 * clean white canvas with a soft drop shadow and a generic spec line,
 * then uploads it to Supabase Storage and updates the product row.
 * Deliberately does NOT import @imgly/background-removal-node (see
 * image-sources.ts for why these must stay in separate processes).
 *
 * Run (after img-precrop.ts and img-cutout.ts):
 *   npx tsx --env-file=.env.local scripts/img-compose.ts [slug...]
 */
import path from "path";
import { readFile } from "fs/promises";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { CANVAS, SOURCES, SKIP_CUTOUT, slugArgs } from "./image-sources";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with --env-file=.env.local"
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const BUCKET = "product-images";
const CACHE_DIR = path.resolve(process.cwd(), ".cache", "cutouts");

function specSvg(text: string) {
  return Buffer.from(`
    <svg width="${CANVAS}" height="70">
      <text x="50%" y="45" font-family="Arial, sans-serif" font-size="26" font-weight="600"
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

async function buildFromCutout(slug: string, specs: string): Promise<Buffer> {
  const cutout = await readFile(path.join(CACHE_DIR, `${slug}.cutout.png`));

  const trimmed = await sharp(cutout).trim().toBuffer();
  const meta = await sharp(trimmed).metadata();
  const productW = meta.width ?? CANVAS;
  const productH = meta.height ?? CANVAS;

  const maxW = 720;
  const maxH = 620;
  const scale = Math.min(maxW / productW, maxH / productH, 1);
  const targetW = Math.round(productW * scale);
  const targetH = Math.round(productH * scale);

  const resizedProduct = await sharp(trimmed).resize(targetW, targetH).toBuffer();

  const left = Math.round((CANVAS - targetW) / 2);
  const top = 60 + (maxH - targetH); // bottom-align within the product area
  const shadowY = top + targetH + 10;

  return sharp({
    create: { width: CANVAS, height: CANVAS, channels: 3, background: "#ffffff" },
  })
    .composite([
      { input: shadowSvg(targetW, shadowY), top: 0, left: 0 },
      { input: resizedProduct, top, left },
      { input: specSvg(specs), top: CANVAS - 80, left: 0 },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
}

async function buildFromOriginal(slug: string, specs: string): Promise<Buffer> {
  const original = await readFile(path.join(CACHE_DIR, `${slug}.precrop.jpg`));

  const enhanced = await sharp(original)
    .resize(CANVAS, CANVAS, { fit: "contain", background: "#ffffff" })
    .sharpen()
    .modulate({ brightness: 1.03, saturation: 1.05 })
    .toBuffer();

  return sharp(enhanced)
    .composite([{ input: specSvg(specs), top: CANVAS - 80, left: 0 }])
    .jpeg({ quality: 92 })
    .toBuffer();
}

async function main() {
  const slugs = slugArgs();

  for (const slug of slugs) {
    const source = SOURCES[slug];
    if (!source) throw new Error(`Unknown slug: ${slug}`);

    const buffer = SKIP_CUTOUT.has(slug)
      ? await buildFromOriginal(slug, source.specs)
      : await buildFromCutout(slug, source.specs);

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
      .update({ image_url: publicUrl })
      .eq("slug", slug);
    if (updateError) throw new Error(`DB update failed for ${slug}: ${updateError.message}`);

    console.log(`  ✓ ${slug}`);
  }

  console.log("Compose phase done — products updated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
