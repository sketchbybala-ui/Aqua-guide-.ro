import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductTable } from "@/components/admin/ProductTable";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Add Product
        </Link>
      </div>
      <ProductTable products={products ?? []} />
    </>
  );
}
