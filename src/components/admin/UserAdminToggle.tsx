"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserAdminToggle({
  userId,
  isAdmin,
  isSelf,
}: {
  userId: string;
  isAdmin: boolean;
  isSelf: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    const next = !isAdmin;
    const confirmMsg = next
      ? "Grant admin access to this user? They'll be able to manage products, orders, and everything else in /admin."
      : "Remove admin access from this user?";
    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_admin: next }),
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

  if (isAdmin && isSelf) {
    return <span className="text-xs text-slate-400">You</span>;
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs font-medium disabled:opacity-50 ${
        isAdmin ? "text-red-600 hover:text-red-700" : "text-brand-600 hover:text-brand-700"
      }`}
    >
      {loading ? "…" : isAdmin ? "Remove admin" : "Make admin"}
    </button>
  );
}
