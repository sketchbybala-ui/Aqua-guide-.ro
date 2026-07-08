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
