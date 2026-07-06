import { createClient } from "@/lib/supabase/server";
import type { RatingSummary, Review } from "@/lib/types";

export async function getReviewsForProduct(productId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

// One query for however many product ids a listing page needs, rather than
// one aggregate query per card.
export async function getRatingSummaries(
  productIds: string[]
): Promise<Record<string, RatingSummary>> {
  if (productIds.length === 0) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("product_rating_summary")
    .select("product_id, avg_rating, review_count")
    .in("product_id", productIds);

  const map: Record<string, RatingSummary> = {};
  for (const row of data ?? []) {
    map[row.product_id] = { avg_rating: row.avg_rating, review_count: row.review_count };
  }
  return map;
}
