"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/ui/StarRating";
import type { Review } from "@/lib/types";

type ReviewRow = Review & { product_name: string };

export function ReviewModeration({ reviews }: { reviews: ReviewRow[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not delete review");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not delete review");
    } finally {
      setDeletingId(null);
    }
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-slate-500">No reviews yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-2xl border border-slate-100 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">{r.product_name}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {r.reviewer_name} &middot;{" "}
                {new Date(r.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </p>
              <StarRating rating={r.rating} size={14} className="mt-1.5" />
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              disabled={deletingId === r.id}
              className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {deletingId === r.id ? "Deleting…" : "Delete"}
            </button>
          </div>
          {r.comment && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.comment}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
