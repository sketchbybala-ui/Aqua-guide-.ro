"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { Order } from "@/lib/types";

export function OrderActions({ order }: { order: Order }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function run(action: "refund" | "mark_paid" | "cancel", confirmMsg: string) {
    if (!confirm(confirmMsg)) return;
    setLoading(action);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(null);
    }
  }

  const canRefund = order.status === "paid" && order.payment_method === "online";
  const canMarkPaid = order.status === "created" && order.payment_method === "cod";
  const canCancel = order.status === "created";

  if (!canRefund && !canMarkPaid && !canCancel) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-100 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Manage Order</h3>
      <div className="flex flex-wrap gap-3">
        {canMarkPaid && (
          <Button
            variant="secondary"
            disabled={loading !== null}
            onClick={() =>
              run("mark_paid", "Mark this COD order as paid (cash collected)?")
            }
          >
            {loading === "mark_paid" ? "Updating…" : "Mark as Paid (Cash Collected)"}
          </Button>
        )}
        {canRefund && (
          <Button
            variant="secondary"
            disabled={loading !== null}
            onClick={() =>
              run(
                "refund",
                `Refund the full amount of this order via Razorpay? This cannot be undone.`
              )
            }
          >
            {loading === "refund" ? "Refunding…" : "Issue Full Refund"}
          </Button>
        )}
        {canCancel && (
          <button
            disabled={loading !== null}
            onClick={() => run("cancel", "Cancel this order?")}
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {loading === "cancel" ? "Cancelling…" : "Cancel Order"}
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
