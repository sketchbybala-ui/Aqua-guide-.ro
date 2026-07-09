// Purely decorative sea-life silhouettes for the deep-ocean themed
// section: fish, seaweed, and coral. Hidden from screen readers; motion
// is disabled under prefers-reduced-motion (see globals.css).

// Note: `flip` is applied on this inner <svg> (not the positioned wrapper
// the caller animates) so the CSS translate animation on the wrapper never
// overwrites/collides with this static scaleX transform.
export function Fish({
  className = "",
  color = "#a5b4fc",
  flip = false,
}: {
  className?: string;
  color?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 40 24"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      <path
        d="M12 12C12 6 20 2 28 2C34 2 38 6 38 12C38 18 34 22 28 22C20 22 12 18 12 12Z"
        fill={color}
      />
      <path d="M12 12 L0 4 L0 20 Z" fill={color} />
      <circle cx="30" cy="9" r="1.6" fill="#0f1044" />
    </svg>
  );
}

export function Seaweed({
  className = "",
  color = "#2dd4bf",
  height = 100,
  style,
}: {
  className?: string;
  color?: string;
  height?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 20 100"
      className={className}
      style={{ ...style, height }}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M10 100 C 2 80 18 68 8 50 C -2 32 18 20 10 0"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function Coral({
  className = "",
  color = "#fb7185",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 60 50" className={className} aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.5">
        <path d="M30 50V28" />
        <path d="M30 34 L18 18" />
        <path d="M30 30 L44 14" />
        <path d="M30 40 L12 32" />
        <path d="M30 38 L48 30" />
      </g>
      <circle cx="18" cy="18" r="3" fill={color} opacity="0.6" />
      <circle cx="44" cy="14" r="3" fill={color} opacity="0.6" />
      <circle cx="12" cy="32" r="2.4" fill={color} opacity="0.6" />
      <circle cx="48" cy="30" r="2.4" fill={color} opacity="0.6" />
    </svg>
  );
}

// Note: like Fish, `flip` lives on this inner <svg> so a translate
// animation on the caller's positioned wrapper never collides with it.
export function Whale({
  className = "",
  color = "#a5b4fc",
  bellyColor = "#4338ca",
  id = "whale",
  flip = false,
}: {
  className?: string;
  color?: string;
  bellyColor?: string;
  id?: string;
  flip?: boolean;
}) {
  const gradientId = `${id}-body`;

  return (
    <svg
      viewBox="0 0 80 46"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      <defs>
        {/* top-lit, darker underneath — gives the body real dimension
            instead of a flat silhouette. */}
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="65%" stopColor={color} />
          <stop offset="100%" stopColor={bellyColor} />
        </linearGradient>
      </defs>

      {/* tail flukes, at the back (left) — own <g> so the tail-flap
          animation (propulsion) layers independently of the whale's
          overall swim/drift animation on the caller's wrapper. */}
      <g className="animate-tail-flap" style={{ transformOrigin: "14px 26px" }}>
        <path d="M14 26 L0 8 L9 23 Z" fill={`url(#${gradientId})`} />
        <path d="M14 26 L0 44 L9 29 Z" fill={`url(#${gradientId})`} />
      </g>
      {/* rounded body */}
      <ellipse cx="42" cy="26" rx="28" ry="15" fill={`url(#${gradientId})`} />
      {/* pectoral fin */}
      <path d="M46 36 L56 46 L44 40 Z" fill={bellyColor} opacity="0.85" />
      {/* dorsal fin */}
      <path d="M39 12 L45 0 L49 13 Z" fill={`url(#${gradientId})`} />
      {/* belly highlight, for a rounder, less-flat read */}
      <ellipse cx="40" cy="33" rx="17" ry="5" fill="#ffffff" opacity="0.14" />
      {/* water spout, from the head (right) */}
      <g stroke="#e0e7ff" strokeWidth="2.6" strokeLinecap="round" opacity="0.9">
        <path d="M62 9 V0" />
        <path d="M57 8 L53 2" />
        <path d="M67 8 L71 2" />
      </g>
      {/* eye */}
      <circle cx="60" cy="24" r="1.8" fill="#0f1044" />
    </svg>
  );
}

export function Starfish({
  className = "",
  color = "#fbbf24",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 1 L24.7 14.6 L38.8 14.9 L27.5 23.4 L31.8 37 L20 28.8 L8.2 37 L12.5 23.4 L1.2 14.9 L15.3 14.6 Z"
        fill={color}
        opacity="0.55"
      />
    </svg>
  );
}
