// Brand mark recreated (in code) from the user's reference: a two-tone
// faceted droplet with a bold rounded "A" in negative space, riding on a
// double wave swoosh. No external image asset — pure SVG, so it stays
// crisp at any size and needs no network fetch.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 230" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ag-dark" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f2050" />
        </linearGradient>
        <linearGradient id="ag-bright" x1="0" y1="0" x2="1" y2="0.9">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="ag-wave-back" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="ag-wave-front" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
      </defs>

      {/* bright (right) body of the droplet */}
      <path
        d="M100 8 C68 52 34 104 34 148 A66 66 0 0 0 166 148 C166 104 132 52 100 8 Z"
        fill="url(#ag-bright)"
      />

      {/* dark left facet */}
      <path
        d="M100 8 C80 40 60 75 48 112 C40 138 40 162 48 184 C36 168 27 148 27 130 C27 100 55 55 100 8 Z"
        fill="url(#ag-dark)"
      />

      {/* "A" in negative space — thick rounded white strokes */}
      <path
        d="M100 56 L65 162 M100 56 L135 162 M82 132 L118 132"
        stroke="#ffffff"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* double wave swoosh across the base */}
      <path
        d="M16 172 C34 196 62 214 96 214 C124 214 146 202 168 196
           C182 192 190 192 188 196 C176 210 152 224 118 224
           C78 224 44 206 22 182 C18 178 16 174 16 172 Z"
        fill="url(#ag-wave-back)"
      />
      <path
        d="M10 182 C30 204 58 220 92 220 C122 220 146 208 172 200
           C182 197 188 197 186 200 C172 216 146 230 112 230
           C72 230 38 212 16 190 C12 186 10 184 10 182 Z"
        fill="url(#ag-wave-front)"
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
      <LogoMark className="h-10 w-auto" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-xl font-bold tracking-tight">
          <span className="text-brand-900">Aqua</span>{" "}
          <span className="text-brand-600">Guide</span>
        </span>
        {tagline && (
          <span className="mt-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            <span className="h-px w-4 bg-brand-600" />
            Pure Water. Better Life.
            <span className="h-px w-4 bg-brand-600" />
          </span>
        )}
      </span>
    </span>
  );
}
