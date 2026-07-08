"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export function CouponForm() {
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("10");
  const [maxUsesPerUser, setMaxUsesPerUser] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, discountPercent, maxUsesPerUser }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create coupon");

      setCode("");
      setDiscountPercent("10");
      setMaxUsesPerUser("1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create coupon");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-100 p-4">
      <div>
        <Label htmlFor="coupon-new-code">Code</Label>
        <Input
          id="coupon-new-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. SUMMER20"
          className="w-40"
          required
        />
      </div>
      <div>
        <Label htmlFor="coupon-new-discount">Discount %</Label>
        <Input
          id="coupon-new-discount"
          type="number"
          min={1}
          max={100}
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          className="w-24"
          required
        />
      </div>
      <div>
        <Label htmlFor="coupon-new-max">Uses per customer</Label>
        <Input
          id="coupon-new-max"
          type="number"
          min={1}
          value={maxUsesPerUser}
          onChange={(e) => setMaxUsesPerUser(e.target.value)}
          className="w-32"
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating…" : "+ Create Coupon"}
      </Button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
