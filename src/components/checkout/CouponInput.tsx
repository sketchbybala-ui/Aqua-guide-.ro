"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { formatINR } from "@/lib/format";

export type AppliedCoupon = {
  code: string;
  discountPercent: number;
  discountAmount: number;
  total: number;
};

export function CouponInput({
  applied,
  onApplied,
  onRemoved,
}: {
  applied: AppliedCoupon | null;
  onApplied: (coupon: AppliedCoupon) => void;
  onRemoved: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not apply coupon");

      onApplied({
        code: code.trim().toUpperCase(),
        discountPercent: data.discountPercent,
        discountAmount: data.discountAmount,
        total: data.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not apply coupon");
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-green-800">
            Coupon <span className="font-mono">{applied.code}</span> applied
          </p>
          <p className="text-xs text-green-700">
            You saved {formatINR(applied.discountAmount)} ({applied.discountPercent}% off)
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCode("");
            onRemoved();
          }}
          className="text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="flex flex-col gap-2">
      <Label htmlFor="coupon-code">Have a coupon code?</Label>
      <div className="flex gap-2">
        <Input
          id="coupon-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. WELCOME10"
          className="flex-1"
        />
        <Button type="submit" variant="secondary" disabled={loading || !code.trim()}>
          {loading ? "Applying…" : "Apply"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
