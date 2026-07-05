// SVG wordmark: a glossy gradient icon tile with a highlighted water drop,
// paired with the "AquaGuide" name. No external image asset — keeps the
// header/favicon dependency-free and easy to swap out later if a real logo
// file is supplied.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">
        <defs>
          <linearGradient id="logo-tile" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="55%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="logo-drop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#dbeafe" />
          </linearGradient>
          <filter id="logo-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#1d4ed8" floodOpacity="0.35" />
          </filter>
        </defs>

        <rect x="1" y="1" width="36" height="36" rx="11" fill="url(#logo-tile)" filter="url(#logo-shadow)" />
        {/* glossy highlight */}
        <path d="M4 12C4 6 9 2 15 2h8c3 0 5 1 6 2-3-1-7 0-10 3L6 20c-1.5-2.5-2-5-2-8Z" fill="#ffffff" opacity="0.16" />

        <path
          d="M19 8.5c3 3.8 5.6 7.3 5.6 10.3a5.6 5.6 0 1 1-11.2 0c0-3 2.6-6.5 5.6-10.3Z"
          fill="url(#logo-drop)"
        />
        <path
          d="M15.7 19.6a3.3 3.3 0 0 0 3 3.1"
          stroke="#2563eb"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xl font-bold tracking-tight text-slate-900">
        Aqua<span className="text-brand-600">Guide</span>
      </span>
    </span>
  );
}
