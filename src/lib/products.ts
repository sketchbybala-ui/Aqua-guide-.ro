import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getActiveProductsByCategory(
  slug: string,
  limit?: number
) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, category:categories!inner(slug, name)")
    .eq("is_active", true)
    .eq("category.slug", slug)
    .order("created_at", { ascending: true });

  if (limit) query = query.limit(limit);

  const { data } = await query;
  return data ?? [];
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(slug, name)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data;
}
