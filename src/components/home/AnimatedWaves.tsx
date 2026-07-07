// Endlessly flowing, layered waves. Each layer is an SVG twice as wide as
// the viewport holding two seamless copies of the same wave; sliding it
// left by half its width (see .animate-wave-* in globals.css) loops with no
// seam. Three layers at different speeds/opacities give a parallax "water"
// depth. Purely decorative — hidden from screen readers, and the motion is
// disabled under prefers-reduced-motion.
//
// `flip` renders the waves upside-down (crests pointing up) — used at the
// top of the footer so the dark water rises into the page above it.
export function AnimatedWaves({
  className = "",
  color = "#102a63",
  flip = false,
  height = 90,
}: {
  className?: string;
  color?: string;
  flip?: boolean;
  height?: number;
}) {
  return (
    <div
      className={`pointer-events-none w-full overflow-hidden leading-[0] ${className}`}
      style={{ height, transform: flip ? "rotate(180deg)" : undefined }}
      aria-hidden="true"
    >
      <div className="relative h-full w-full">
        <Layer className="animate-wave-slow" color={color} opacity={0.35} translateY={12} />
        <Layer className="animate-wave-med" color={color} opacity={0.55} translateY={6} />
        <Layer className="animate-wave-fast" color={color} opacity={1} translateY={0} />
      </div>
    </div>
  );
}

function Layer({
  className,
  color,
  opacity,
  translateY,
}: {
  className: string;
  color: string;
  opacity: number;
  translateY: number;
}) {
  return (
    <svg
      className={`absolute bottom-0 left-0 h-full ${className}`}
      style={{ width: "200%", transform: `translateY(${translateY}px)` }}
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
    >
      {/* one wave period is 720 units (crest at 180, trough at 540); the
          path lays two identical periods end to end so a -50% slide loops
          seamlessly. */}
      <path
        fill={color}
        opacity={opacity}
        d="M0 45
           Q 180 15 360 45 T 720 45
           T 1080 45 T 1440 45
           V90 H0 Z"
      />
    </svg>
  );
}
