"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CouponToggle({ couponId, isActive }: { couponId: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not update");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs font-medium disabled:opacity-50 ${
        isActive ? "text-red-600 hover:text-red-700" : "text-brand-600 hover:text-brand-700"
      }`}
    >
      {loading ? "…" : isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
