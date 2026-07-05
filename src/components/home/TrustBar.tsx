const items = [
  { label: "Advanced Purification Technology", icon: DropIcon },
  { label: "100% Safe & Hygienic Water", icon: ShieldIcon },
  { label: "Eco-Friendly & Energy Efficient", icon: LeafIcon },
  { label: "Low Maintenance & Durable", icon: WrenchIcon },
];

export function TrustBar() {
  return (
    <section className="bg-brand-900">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
        {items.map(({ label, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-brand-100">
              <Icon />
            </span>
            <span className="text-sm font-medium text-blue-50">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function DropIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5c3.5 4.2 6.5 8.1 6.5 11.6a6.5 6.5 0 1 1-13 0c0-3.5 3-7.4 6.5-11.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19c9 1 13-4 14-13-9-1-13 4-14 13Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M6 18C10 14 13 11 17 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.7 6.3a4 4 0 0 0-5.4 5l-6 6 2 2 6-6a4 4 0 0 0 5-5.4l-2.6 2.6-2-2 2.6-2.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
