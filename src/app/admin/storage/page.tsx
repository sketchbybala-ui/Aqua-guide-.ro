import { createAdminClient } from "@/lib/supabase/admin";

// Recursively walks the product-images bucket, summing file sizes per
// top-level folder. Storage's list() API isn't recursive, so this walks
// down manually — capped at a modest depth since the bucket only ever
// holds a few known folders (products/enhanced, products/hero, reviews/*).
export const dynamic = "force-dynamic";

const BUCKET = "product-images";
const MAX_DEPTH = 4;

type FolderStats = { fileCount: number; totalBytes: number };

async function walk(
  admin: ReturnType<typeof createAdminClient>,
  path: string,
  depth = 0
): Promise<FolderStats> {
  if (depth > MAX_DEPTH) return { fileCount: 0, totalBytes: 0 };

  const { data: entries } = await admin.storage.from(BUCKET).list(path, { limit: 1000 });
  let fileCount = 0;
  let totalBytes = 0;

  for (const entry of entries ?? []) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name;
    if (entry.id === null) {
      // A "folder" — list() represents these as entries with no id/metadata.
      const sub = await walk(admin, entryPath, depth + 1);
      fileCount += sub.fileCount;
      totalBytes += sub.totalBytes;
    } else {
      fileCount += 1;
      totalBytes += entry.metadata?.size ?? 0;
    }
  }

  return { fileCount, totalBytes };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminStoragePage() {
  const admin = createAdminClient();

  const { data: topLevel } = await admin.storage.from(BUCKET).list("", { limit: 100 });
  const folders = (topLevel ?? []).filter((e) => e.id === null);

  const stats = await Promise.all(
    folders.map(async (folder) => ({
      name: folder.name,
      ...(await walk(admin, folder.name)),
    }))
  );

  const grandTotalFiles = stats.reduce((s, f) => s + f.fileCount, 0);
  const grandTotalBytes = stats.reduce((s, f) => s + f.totalBytes, 0);

  return (
    <div>
      <p className="mb-6 text-sm text-slate-500">
        Storage usage for the <span className="font-mono">{BUCKET}</span> bucket
        (product photos, review photos).
      </p>

      <div className="mb-6 rounded-2xl bg-brand-900 p-5 text-white">
        <p className="text-2xl font-bold">{formatBytes(grandTotalBytes)}</p>
        <p className="text-sm text-blue-200">
          {grandTotalFiles} file{grandTotalFiles === 1 ? "" : "s"} total
        </p>
      </div>

      {stats.length === 0 ? (
        <p className="text-sm text-slate-500">No files yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Folder</th>
                <th className="px-4 py-3">Files</th>
                <th className="px-4 py-3">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.map((f) => (
                <tr key={f.name}>
                  <td className="px-4 py-3 font-mono text-slate-900">/{f.name}</td>
                  <td className="px-4 py-3 text-slate-600">{f.fileCount}</td>
                  <td className="px-4 py-3 text-slate-600">{formatBytes(f.totalBytes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
