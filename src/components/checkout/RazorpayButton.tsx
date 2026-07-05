"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

// Minimal shape of what we use from the Razorpay Checkout.js global.
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

export type ShippingInfo = {
  name: string;
  phone: string;
  address: string;
};

export function RazorpayButton({
  shippingInfo,
  disabled = false,
}: {
  shippingInfo: ShippingInfo;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handlePay() {
    setLoading(true);
    setError(null);

    try {
      const createRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingName: shippingInfo.name,
          shippingPhone: shippingInfo.phone,
          shippingAddress: shippingInfo.address,
        }),
      });
      const order = await createRes.json();

      if (!createRes.ok) {
        throw new Error(order.error ?? "Could not start checkout");
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: "Aqua Guide",
        description: "Water purifier order",
        theme: { color: "#2563eb" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              localOrderId: order.localOrderId,
            }),
          });

          if (verifyRes.ok) {
            router.push(`/checkout/success?order_id=${order.localOrderId}`);
          } else {
            setError(
              "Payment could not be verified. Please contact support if you were charged."
            );
          }
        },
      });

      razorpay.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
      });

      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={handlePay} disabled={loading || disabled} className="w-full">
        {loading ? "Starting checkout…" : "Pay with Razorpay"}
      </Button>
    </div>
  );
}
