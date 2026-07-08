import { createClient } from "@/lib/supabase/server";

// page_views_admin_select_all lets an admin session read every row —
// never statically prerendered.
export const dynamic = "force-dynamic";

export default async function AdminVisitorsPage() {
  const supabase = await createClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [{ count: totalViews }, { count: todayViews }, { data: recentRows }] =
    await Promise.all([
      supabase.from("page_views").select("id", { count: "exact", head: true }),
      supabase
        .from("page_views")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfToday.toISOString()),
      supabase
        .from("page_views")
        .select("path, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(5000),
    ]);

  const rows = recentRows ?? [];

  // Top pages, last 30 days.
  const pathCounts = new Map<string, number>();
  for (const r of rows) {
    pathCounts.set(r.path, (pathCounts.get(r.path) ?? 0) + 1);
  }
  const topPages = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Daily counts, last 7 days.
  const dayCounts = new Map<string, number>();
  for (const r of rows) {
    if (new Date(r.created_at) < sevenDaysAgo) continue;
    const day = r.created_at.slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const maxDayCount = Math.max(1, ...last7Days.map((d) => dayCounts.get(d) ?? 0));

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-brand-900 p-5 text-white">
          <p className="text-2xl font-bold">{totalViews ?? 0}</p>
          <p className="text-sm text-blue-200">Total page views</p>
        </div>
        <div className="rounded-2xl border border-slate-100 p-5">
          <p className="text-2xl font-bold text-slate-900">{todayViews ?? 0}</p>
          <p className="text-sm text-slate-500">Views today</p>
        </div>
        <div className="rounded-2xl border border-slate-100 p-5">
          <p className="text-2xl font-bold text-slate-900">{pathCounts.size}</p>
          <p className="text-sm text-slate-500">Distinct pages (30d)</p>
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-100 p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Last 7 Days</h3>
        <div className="flex items-end gap-3" style={{ height: 120 }}>
          {last7Days.map((day) => {
            const count = dayCounts.get(day) ?? 0;
            const heightPct = (count / maxDayCount) * 100;
            return (
              <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full rounded-t bg-brand-500"
                    style={{ height: `${Math.max(heightPct, count > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(day).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
                <span className="text-xs font-medium text-slate-600">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">Top Pages (30 days)</h3>
        {topPages.length === 0 ? (
          <p className="text-sm text-slate-500">No visits recorded yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {topPages.map(([path, count]) => (
              <li key={path} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-mono text-slate-700">{path}</span>
                <span className="font-medium text-slate-900">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
