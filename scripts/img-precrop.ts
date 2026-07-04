/**
 * Phase 1/3 of the image-enhancement pipeline: crop each product's tile out
 * of its source poster/photo using sharp, and cache the plain JPEG locally.
 * Deliberately does NOT import @imgly/background-removal-node (see
 * image-sources.ts for why these must stay in separate processes).
 *
 * Run: npx tsx scripts/img-precrop.ts [slug...]
 */
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import sharp from "sharp";
import { SOURCES, slugArgs } from "./image-sources";

const IMAGE_ROOT = path.resolve(process.cwd(), "image");
const CACHE_DIR = path.resolve(process.cwd(), ".cache", "cutouts");

async function main() {
  await mkdir(CACHE_DIR, { recursive: true });
  const slugs = slugArgs();

  for (const slug of slugs) {
    const source = SOURCES[slug];
    const rawPath = path.join(IMAGE_ROOT, source.file);
    const cropped = source.box
      ? await sharp(rawPath).extract(source.box).jpeg({ quality: 95 }).toBuffer()
      : await sharp(rawPath).jpeg({ quality: 95 }).toBuffer();

    await writeFile(path.join(CACHE_DIR, `${slug}.precrop.jpg`), cropped);
    console.log(`  ✓ ${slug}`);
  }

  console.log("Precrop phase done. Now run: npx tsx scripts/img-cutout.ts");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
