// An animated "purity tank": a circular vessel with continuously flowing
// water (two looping wave layers), rising bubbles, and a droplet mark at
// the center. Pure SVG + CSS animations (see globals.css) — no images, no
// animation library.
export function WaterTankAnimation({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 320" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="tank-wave-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="tank-wave-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <clipPath id="tank-circle">
          <circle cx="160" cy="160" r="132" />
        </clipPath>
      </defs>

      {/* outer ring + shadow */}
      <ellipse cx="160" cy="300" rx="110" ry="12" fill="#0f172a" opacity="0.06" />
      <circle cx="160" cy="160" r="140" fill="#ffffff" />
      <circle cx="160" cy="160" r="140" fill="none" stroke="#dbeafe" strokeWidth="3" />
      <circle cx="160" cy="160" r="132" fill="#eff6ff" />

      {/* flowing water, clipped to the circle */}
      <g clipPath="url(#tank-circle)">
        <rect x="28" y="150" width="264" height="150" fill="#dbeafe" />

        <g className="animate-wave-scroll-slow">
          <path
            d="M0 150c20-14 40-14 60 0s40 14 60 0 40-14 60 0 40 14 60 0 40-14 60 0 40 14 60 0v150H0Z"
            fill="url(#tank-wave-back)"
            opacity="0.55"
          />
          <path
            d="M320 150c20-14 40-14 60 0s40 14 60 0 40-14 60 0 40 14 60 0 40-14 60 0 40 14 60 0v150H320Z"
            fill="url(#tank-wave-back)"
            opacity="0.55"
          />
        </g>

        <g className="animate-wave-scroll-fast">
          <path
            d="M0 168c18-12 36-12 54 0s36 12 54 0 36-12 54 0 36 12 54 0 36-12 54 0 36 12 54 0v132H0Z"
            fill="url(#tank-wave-front)"
          />
          <path
            d="M324 168c18-12 36-12 54 0s36 12 54 0 36-12 54 0 36 12 54 0 36-12 54 0 36 12 54 0v132H324Z"
            fill="url(#tank-wave-front)"
          />
        </g>

        {/* rising bubbles */}
        <circle cx="120" cy="270" r="4" fill="#ffffff" opacity="0.8" className="animate-ro-bubble" />
        <circle cx="160" cy="270" r="3" fill="#ffffff" opacity="0.7" className="animate-ro-bubble" style={{ animationDelay: "1s" }} />
        <circle cx="200" cy="270" r="5" fill="#ffffff" opacity="0.8" className="animate-ro-bubble" style={{ animationDelay: "2s" }} />
        <circle cx="140" cy="270" r="3.5" fill="#ffffff" opacity="0.7" className="animate-ro-bubble" style={{ animationDelay: "2.8s" }} />
      </g>

      {/* center droplet mark */}
      <g transform="translate(160 128) scale(1.15)">
        <path
          d="M0-32c11 14 21 27 21 38a21 21 0 1 1-42 0c0-11 10-24 21-38Z"
          fill="#ffffff"
        />
        <path
          d="M-9 10a10.5 10.5 0 0 0 9.5 9.6"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* pulsing "active" ring */}
      <circle cx="160" cy="160" r="140" fill="none" stroke="#2563eb" strokeWidth="2" opacity="0.25" className="animate-ro-pulse" />
    </svg>
  );
}
