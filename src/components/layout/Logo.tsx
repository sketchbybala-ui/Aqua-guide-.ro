// Simple SVG wordmark: a water-drop mark + "Aqua Guide" text. No external
// image asset — keeps the header/favicon dependency-free and easy to swap
// out later if a real logo file is supplied.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 2.5c3.5 4.2 6.5 8.1 6.5 11.6a6.5 6.5 0 1 1-13 0c0-3.5 3-7.4 6.5-11.6Z"
          fill="#2563eb"
        />
        <path
          d="M8.7 14.8a3.6 3.6 0 0 0 3.3 3.6"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-slate-900">
        Aqua Guide
      </span>
    </span>
  );
}
