// Animated success checkmark: the circle pops in, then the check stroke
// draws itself. Pure CSS animation (see .animate-pop-in / .animate-draw-check
// in globals.css) — no client JS needed.
export function SuccessCheck() {
  return (
    <div className="animate-pop-in mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 12.5l4.5 4.5L19 7"
          stroke="#16a34a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-check"
        />
      </svg>
    </div>
  );
}
