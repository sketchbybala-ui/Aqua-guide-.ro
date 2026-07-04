import { createClient } from "@/lib/supabase/server";
import { ProductTable } from "@/components/admin/ProductTable";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .order("created_at", { ascending: false });

  return <ProductTable products={products ?? []} />;
}
