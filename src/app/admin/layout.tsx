import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

// Reads the logged-in user's session on every request — applies to this
// whole route subtree, so no admin page is ever statically prerendered.
export const dynamic = "force-dynamic";

// Server-side admin gate: redirects non-admins before any admin UI or data
// is ever sent to the browser. This is layered on top of the RLS policies
// on products/categories (which reject non-admin writes at the DB level
// regardless of what the UI does).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Admin &middot; Products
        </h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Add Product
        </Link>
      </div>
      {children}
    </section>
  );
}
