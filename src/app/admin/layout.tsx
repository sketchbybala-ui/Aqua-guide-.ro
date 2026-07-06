import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

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
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Admin</h1>
      <AdminNav />
      <div className="mt-8">{children}</div>
    </section>
  );
}
