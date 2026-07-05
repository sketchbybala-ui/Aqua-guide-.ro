// SVG wordmark: a circular badge with a water-drop mark + ripple ring, paired
// with the "Aqua Guide" name. No external image asset — keeps the
// header/favicon dependency-free and easy to swap out later if a real logo
// file is supplied.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <circle cx="17" cy="17" r="16" fill="url(#logo-grad)" />
        <circle
          cx="17"
          cy="17"
          r="12.5"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <path
          d="M17 8.5c2.7 3.4 5 6.6 5 9.4a5 5 0 1 1-10 0c0-2.8 2.3-6 5-9.4Z"
          fill="#ffffff"
        />
        <path
          d="M14.4 18.4a2.7 2.7 0 0 0 2.5 2.6"
          stroke="#2563eb"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight text-slate-900">
          Aqua<span className="text-brand-600">Guide</span>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
          Pure Water Living
        </span>
      </span>
    </span>
  );
}
