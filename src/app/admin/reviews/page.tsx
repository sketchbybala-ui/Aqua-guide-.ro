import { createClient } from "@/lib/supabase/server";
import { ReviewModeration } from "@/components/admin/ReviewModeration";

// reviews_select_all already lets anyone (including this admin session)
// read every review — never statically prerendered.
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, product:products(name)")
    .order("created_at", { ascending: false });

  const rows = (reviews ?? []).map((r) => ({
    ...r,
    product_name: (r as unknown as { product: { name: string } | null }).product?.name ?? "—",
  }));

  return <ReviewModeration reviews={rows} />;
}
