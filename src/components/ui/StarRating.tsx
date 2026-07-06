// Read-only star display (supports fractional averages like 4.3 via clip-path).
export function StarRating({
  rating,
  size = 16,
  className = "",
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center ${className}`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((position) => {
        const fill = Math.max(0, Math.min(1, rating - (position - 1)));
        return (
          <span key={position} className="relative inline-block" style={{ width: size, height: size }}>
            <StarIcon size={size} className="absolute inset-0 text-slate-200" filled />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <StarIcon size={size} className="text-amber-400" filled />
            </span>
          </span>
        );
      })}
    </div>
  );
}

function StarIcon({
  size,
  className,
}: {
  size: number;
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.8l-5.2 2.9 1-5.9-4.3-4.1 5.9-.8L10 1.5Z" />
    </svg>
  );
}
