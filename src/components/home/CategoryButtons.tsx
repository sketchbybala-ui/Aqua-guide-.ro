import Link from "next/link";

const CATEGORIES = [
  {
    href: "/home-use",
    title: "Home Use",
    description: "Compact RO purifiers for kitchens and apartments.",
  },
  {
    href: "/commercial",
    title: "Commercial Use",
    description: "High-capacity RO plants for offices, shops, and industry.",
  },
];

export function CategoryButtons() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CATEGORIES.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="group flex items-center justify-between rounded-2xl bg-brand-600 px-6 py-6 text-white transition-colors hover:bg-brand-700"
          >
            <div>
              <h3 className="text-lg font-semibold">{category.title}</h3>
              <p className="mt-1 text-sm text-blue-100">{category.description}</p>
            </div>
            <span
              aria-hidden="true"
              className="ml-4 shrink-0 text-2xl transition-transform group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
