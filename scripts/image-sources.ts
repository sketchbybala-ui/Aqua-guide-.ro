/**
 * Shared config for the image-enhancement pipeline (img-precrop.ts,
 * img-cutout.ts, img-compose.ts). Deliberately has NO imports of `sharp`
 * or `@imgly/background-removal-node` — those two native modules crash
 * when loaded in the same process, so each phase runs as a separate `tsx`
 * invocation and only this plain-data file is shared between them.
 */

export const CANVAS = 1000;
export const HOME_USE_SPECS = "RO + UV Purification  •  Compact Countertop Design";
export const COMMERCIAL_SPECS = "High-Capacity RO System  •  Built for Continuous Use";

// Busy/cluttered source photos where automated cutout fails (ghosting
// artifacts, or a decorative background baked into the whole photo that
// can't be separated from the product) — these get a light quality pass
// instead, no cutout attempt, with a tighter box that excludes any baked-in
// name/price text so it doesn't collide with our own spec-text overlay.
export const SKIP_CUTOUT = new Set([
  "industrial-containerized-ro-plant",
  "3-stage-ro-system-white",
  "aqua-innovica",
  "clean-water-aqua-xl-silver",
  "nile-aqua-v5",
  "clean-water-hi-flo",
  "aqua-grid-teal",
  "aqua-grid-charcoal",
]);

export type Box = { left: number; top: number; width: number; height: number };

const posterARow1 = (col: number): Box => ({ left: col * 256, top: 140, width: 256, height: 350 });
const posterARow2 = (col: number): Box => ({ left: col * 288, top: 490, width: 256, height: 420 });
const posterBCell = (col: number, row: number): Box => ({
  left: col * 384,
  top: row === 2 ? 918 : row * 459,
  width: 384,
  height: row === 2 ? 458 : 459,
});

const POSTER_A = "house ro/WhatsApp Image 2026-07-02 at 3.47.12 PM.jpeg";
const POSTER_B = "house ro/catlog2.jpeg";

export type Source = { file: string; box?: Box; specs: string };

export const SOURCES: Record<string, Source> = {
  "lexpure-vedic": { file: POSTER_A, box: posterARow1(0), specs: HOME_USE_SPECS },
  "vista-pro": { file: POSTER_A, box: posterARow1(1), specs: HOME_USE_SPECS },
  "3-stage-ro-system-blue": { file: POSTER_A, box: posterARow1(2), specs: HOME_USE_SPECS },
  // Tighter, product-only box (excludes the baked-in name/price banner —
  // background removal failed on this one, see SKIP_CUTOUT above).
  "3-stage-ro-system-white": { file: POSTER_A, box: { left: 768, top: 140, width: 256, height: 230 }, specs: HOME_USE_SPECS },
  "aqua-glory": { file: POSTER_A, box: posterARow1(4), specs: HOME_USE_SPECS },
  "aqua-cyclone": { file: POSTER_A, box: posterARow1(5), specs: HOME_USE_SPECS },
  "aquagrand-ro-uv": { file: POSTER_A, box: posterARow2(0), specs: HOME_USE_SPECS },
  "aqua-touch": { file: POSTER_A, box: posterARow2(1), specs: HOME_USE_SPECS },
  "aqua-roma": { file: POSTER_A, box: posterARow2(2), specs: HOME_USE_SPECS },
  "neptune-aps": { file: POSTER_A, box: posterARow2(3), specs: HOME_USE_SPECS },
  // Tighter, product-only box (see SKIP_CUTOUT above).
  "aqua-innovica": { file: POSTER_A, box: { left: 1152, top: 490, width: 256, height: 340 }, specs: HOME_USE_SPECS },
  "nile-aqua-innovica-lavish": { file: POSTER_B, box: posterBCell(0, 0), specs: HOME_USE_SPECS },
  // The remaining Poster B products (below) have a decorative background
  // (ocean/leaf/ripple photography) baked into the whole card, not just a
  // removable band — cutout can't isolate the product from it, so these
  // use a box that excludes only the bottom name/spec/price text and keep
  // the rest of the original card art as-is (see SKIP_CUTOUT above).
  "clean-water-aqua-xl-silver": { file: POSTER_B, box: { left: 384, top: 0, width: 384, height: 369 }, specs: HOME_USE_SPECS },
  "nile-aqua-v5": { file: POSTER_B, box: { left: 0, top: 474, width: 384, height: 354 }, specs: HOME_USE_SPECS },
  "clean-water-hi-flo": { file: POSTER_B, box: { left: 384, top: 474, width: 384, height: 354 }, specs: HOME_USE_SPECS },
  "aqua-grid-teal": { file: POSTER_B, box: { left: 0, top: 933, width: 384, height: 354 }, specs: HOME_USE_SPECS },
  "aqua-grid-charcoal": { file: POSTER_B, box: { left: 384, top: 933, width: 384, height: 354 }, specs: HOME_USE_SPECS },

  // Commercial source photos all have a price ("rs: ...") baked into the
  // bottom of the image itself — each box below excludes that band so it
  // never collides with our own spec-text overlay.
  "industrial-containerized-ro-plant": {
    file: "commersial ro/WhatsApp Image 2026-07-03 at 4.27.26 PM.jpeg",
    box: { left: 0, top: 0, width: 1280, height: 1100 },
    specs: COMMERCIAL_SPECS,
  },
  "ozean-commercial-ro-plant": {
    file: "commersial ro/WhatsApp Image 2026-07-03 at 4.27.26 PM (1).jpeg",
    box: { left: 0, top: 0, width: 977, height: 1130 },
    specs: COMMERCIAL_SPECS,
  },
  "twin-tank-commercial-ro-system": {
    file: "commersial ro/WhatsApp Image 2026-07-03 at 4.27.27 PM.jpeg",
    box: { left: 0, top: 0, width: 1280, height: 1130 },
    specs: COMMERCIAL_SPECS,
  },
  "ss-aqua-ro-mobile-unit": {
    file: "commersial ro/WhatsApp Image 2026-07-03 at 4.27.27 PM (1).jpeg",
    box: { left: 0, top: 0, width: 1280, height: 1100 },
    specs: COMMERCIAL_SPECS,
  },
  "heavy-duty-skid-ro-container-plant": {
    file: "commersial ro/WhatsApp Image 2026-07-03 at 4.27.27 PM (2).jpeg",
    box: { left: 0, top: 0, width: 1100, height: 970 },
    specs: COMMERCIAL_SPECS,
  },
};

export function slugArgs(): string[] {
  const args = process.argv.slice(2);
  return args.length > 0 ? args : Object.keys(SOURCES);
}
