"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { ShippingInfo } from "./RazorpayButton";

export function CodButton({
  shippingInfo,
  couponCode,
  disabled = false,
}: {
  shippingInfo: ShippingInfo;
  couponCode?: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handlePlaceOrder() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingName: shippingInfo.name,
          shippingPhone: shippingInfo.phone,
          shippingAddress: shippingInfo.address,
          couponCode,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Could not place order");
      }

      router.push(`/checkout/success?order_id=${data.localOrderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={handlePlaceOrder} disabled={loading || disabled} className="w-full">
        {loading ? "Placing order…" : "Place Order (Pay on Delivery)"}
      </Button>
    </div>
  );
}
