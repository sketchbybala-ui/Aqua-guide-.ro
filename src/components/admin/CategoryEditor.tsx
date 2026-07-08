"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import type { Category } from "@/lib/types";

export function CategoryEditor({ category }: { category: Category }) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 p-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
        /{category.slug}
      </p>
      <div className="flex flex-col gap-3">
        <div>
          <Label htmlFor={`cat-name-${category.id}`}>Name</Label>
          <Input
            id={`cat-name-${category.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor={`cat-desc-${category.id}`}>Description</Label>
          <Textarea
            id={`cat-desc-${category.id}`}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="mt-2 text-sm text-green-600">Saved.</p>}
      <Button type="submit" disabled={saving} className="mt-3">
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
