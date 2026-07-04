/**
 * Phase 2/3 of the image-enhancement pipeline: runs ML background removal
 * on each precropped photo. Deliberately does NOT import `sharp` anywhere
 * in this file or its dependencies — @imgly/background-removal-node bundles
 * its own internal sharp build, and having our root `sharp` also loaded in
 * the same process causes a native crash (see image-sources.ts).
 *
 * Run (after img-precrop.ts): npx tsx scripts/img-cutout.ts [slug...]
 */
import path from "path";
import { readFile, writeFile } from "fs/promises";
import { removeBackground } from "@imgly/background-removal-node";
import { SOURCES, SKIP_CUTOUT, slugArgs } from "./image-sources";

const CACHE_DIR = path.resolve(process.cwd(), ".cache", "cutouts");

async function main() {
  const slugs = slugArgs().filter((slug) => !SKIP_CUTOUT.has(slug));

  for (const slug of slugs) {
    if (!SOURCES[slug]) throw new Error(`Unknown slug: ${slug}`);

    const precropped = await readFile(path.join(CACHE_DIR, `${slug}.precrop.jpg`));
    const blob = await removeBackground(
      new Blob([precropped], { type: "image/jpeg" })
    );
    const cutout = Buffer.from(await blob.arrayBuffer());

    await writeFile(path.join(CACHE_DIR, `${slug}.cutout.png`), cutout);
    console.log(`  ✓ ${slug}`);
  }

  console.log("Cutout phase done. Now run: npx tsx scripts/img-compose.ts");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
