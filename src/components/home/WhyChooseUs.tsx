const items = [
  {
    title: "100% Pure Water",
    description: "Ensures clean and safe drinking water.",
    icon: DropIcon,
  },
  {
    title: "Advanced Technology",
    description: "Latest RO, UV, UF & TDS control technology.",
    icon: BoltIcon,
  },
  {
    title: "Energy Efficient",
    description: "Saves more water and reduces electricity usage.",
    icon: LeafIcon,
  },
  {
    title: "Easy Maintenance",
    description: "Low maintenance and easy service support.",
    icon: WrenchIcon,
  },
  {
    title: "Customer Support",
    description: "24/7 support for all your queries.",
    icon: HeadsetIcon,
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-semibold text-slate-900 sm:text-3xl">
          The Best Water Purifier Brand You Can Trust
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {items.map(({ title, description, icon: Icon }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">
                {title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DropIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5c3.5 4.2 6.5 8.1 6.5 11.6a6.5 6.5 0 1 1-13 0c0-3.5 3-7.4 6.5-11.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19c9 1 13-4 14-13-9-1-13 4-14 13Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M6 18C10 14 13 11 17 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.7 6.3a4 4 0 0 0-5.4 5l-6 6 2 2 6-6a4 4 0 0 0 5-5.4l-2.6 2.6-2-2 2.6-2.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 13v-1a8 8 0 1 1 16 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
