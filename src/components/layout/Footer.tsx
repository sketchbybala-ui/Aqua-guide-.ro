import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Logo />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <Link href="/home-use" className="hover:text-brand-600">
              Home Use
            </Link>
            <Link href="/commercial" className="hover:text-brand-600">
              Commercial Use
            </Link>
            <Link href="/account/orders" className="hover:text-brand-600">
              Track Orders
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Aqua Guide. Pure water, healthy
          life.
        </p>
      </div>
    </footer>
  );
}
