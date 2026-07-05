import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 bg-brand-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <span className="text-lg font-bold tracking-tight text-white">
            Aqua<span className="text-brand-200">Guide</span>
          </span>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-100">
            <Link href="/home-use" className="hover:text-white">
              Home Use
            </Link>
            <Link href="/commercial" className="hover:text-white">
              Commercial Use
            </Link>
            <Link href="/account/orders" className="hover:text-white">
              Track Orders
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-blue-200/70">
          &copy; {new Date().getFullYear()} Aqua Guide. Pure water, healthy
          life.
        </p>
      </div>
    </footer>
  );
}
