"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function RefundRequestButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRequest() {
    if (
      !confirm(
        "Request a refund for this order? Our team will review it and process the refund to your original payment method if approved."
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${orderId}/request-refund`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not request refund");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not request refund");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button variant="secondary" onClick={handleRequest} disabled={loading}>
        {loading ? "Requesting…" : "Request a Refund"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
