import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserAdminToggle } from "@/components/admin/UserAdminToggle";

// Lists every account (auth.users, only reachable via the service-role
// admin API) merged with their profile — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const currentUser = await requireAdmin();
  const { q } = await searchParams;
  const search = (q ?? "").trim().toLowerCase();

  const admin = createAdminClient();

  const [{ data: userList }, { data: profiles }, { data: orders }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from("profiles").select("id, full_name, phone, is_admin"),
    admin.from("orders").select("user_id"),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const orderCountById = new Map<string, number>();
  for (const o of orders ?? []) {
    orderCountById.set(o.user_id, (orderCountById.get(o.user_id) ?? 0) + 1);
  }

  let users = (userList?.users ?? []).map((u) => {
    const profile = profileById.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "—",
      fullName: profile?.full_name ?? null,
      phone: profile?.phone ?? null,
      isAdmin: profile?.is_admin ?? false,
      orderCount: orderCountById.get(u.id) ?? 0,
      createdAt: u.created_at,
    };
  });

  if (search) {
    users = users.filter(
      (u) =>
        u.email.toLowerCase().includes(search) ||
        (u.fullName ?? "").toLowerCase().includes(search)
    );
  }

  users.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div>
      <form method="get" className="mb-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search by email or name…"
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-100"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Search
        </button>
        {search && (
          <Link
            href="/admin/users"
            className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Clear
          </Link>
        )}
      </form>

      {users.length === 0 ? (
        <p className="text-sm text-slate-500">No users match this search.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{u.fullName || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{u.phone || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{u.orderCount}</td>
                  <td className="px-4 py-3">
                    {u.isAdmin ? (
                      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Customer</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <UserAdminToggle
                      userId={u.id}
                      isAdmin={u.isAdmin}
                      isSelf={u.id === currentUser.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
