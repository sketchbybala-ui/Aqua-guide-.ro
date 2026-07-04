"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";

type Row = Product & { category?: { name: string } };

export function ProductTable({ products }: { products: Row[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;

    setDeletingId(id);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (res.ok) {
      router.refresh();
    } else {
      alert("Could not delete product.");
    }
  }

  if (products.length === 0) {
    return <p className="text-sm text-slate-500">No products yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Active</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3 font-medium text-slate-900">
                {product.name}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {product.category?.name ?? "—"}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {formatINR(product.price)}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {product.is_active ? "Yes" : "No"}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="mr-4 font-medium text-brand-600 hover:text-brand-700"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                  className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
