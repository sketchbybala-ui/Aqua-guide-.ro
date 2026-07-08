import { createClient } from "@/lib/supabase/server";
import { CategoryEditor } from "@/components/admin/CategoryEditor";

// categories_select_all lets anyone read categories — never statically
// prerendered.
export const dynamic = "force-dynamic";

export default async function AdminCatalogPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div>
      <p className="mb-6 text-sm text-slate-500">
        Edit the name and description shown for each product category across
        the site (home page, category pages, and navigation labels stay in
        sync automatically).
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(categories ?? []).map((category) => (
          <CategoryEditor key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
