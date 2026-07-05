// Recreated (in code) to match the uploaded brand mark: a droplet with a
// negative-space "A" cut out of it (true cutout via fill-rule evenodd, so
// it reads correctly on any background colour), a wave swoosh across the
// base, and the "Aqua Guide" wordmark. No external image asset.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 116" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mark-drop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="mark-wave-back" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="mark-wave-front" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>

      {/* droplet body with a true "A" cutout (evenodd hole) */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="url(#mark-drop)"
        d="M50 2C33 24 15 50 15 70a35 35 0 0 0 70 0c0-20-18-46-35-68Z
           M50 34 32 78h10l3.6-9h8.8l3.6 9h10L50 34Zm0 19.5 4.6 11h-9.2L50 53.5Z"
      />

      {/* wave swoosh across the base */}
      <path
        d="M8 76c14 12 30 15 45 8 12-5.5 24-6 32 1-10-2-20 0-29 6-16 10-34 6-48-15Z"
        fill="url(#mark-wave-back)"
      />
      <path
        d="M4 82c16 11 34 12 49 3 11-6.5 22-6 30 0-9-1-18 2-26 8-17 12-37 6-53-11Z"
        fill="url(#mark-wave-front)"
      />
    </svg>
  );
}

export function Logo({
  className = "",
  tagline = false,
}: {
  className?: string;
  tagline?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-9 w-auto" />
      <span className="flex flex-col leading-none">
        <span className="text-xl font-bold tracking-tight text-slate-900">
          Aqua<span className="text-brand-600">Guide</span>
        </span>
        {tagline && (
          <span className="mt-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-slate-400">
            <span className="h-px w-4 bg-slate-300" />
            Pure Water. Better Life.
            <span className="h-px w-4 bg-slate-300" />
          </span>
        )}
      </span>
    </span>
  );
}
