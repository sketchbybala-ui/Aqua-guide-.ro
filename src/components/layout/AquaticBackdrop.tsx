import { Bubbles } from "@/components/home/Bubbles";

// Reusable decorative backdrop for otherwise-plain white pages (category
// listings, cart, checkout, auth, account) — soft glows, a dot texture,
// and rising bubbles, matching the homepage's aquatic language. Purely
// decorative: absolutely positioned behind content, hidden from screen
// readers. The parent section needs `relative overflow-hidden`, and real
// content needs `relative` (so it paints above this layer).
export function AquaticBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-brand-300/25 blur-3xl" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.25]">
        <defs>
          <pattern id="aqua-backdrop-dots" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.6" fill="#93c5fd" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#aqua-backdrop-dots)" />
      </svg>
      <Bubbles />
    </div>
  );
}
