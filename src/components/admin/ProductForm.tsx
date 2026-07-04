"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { ImageUploader } from "./ImageUploader";
import { slugify } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

export function ProductForm({
  categories,
  initialProduct,
}: {
  categories: Category[];
  initialProduct?: Product;
}) {
  const router = useRouter();
  const isEdit = !!initialProduct;

  const [name, setName] = useState(initialProduct?.name ?? "");
  const [slug, setSlug] = useState(initialProduct?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [categoryId, setCategoryId] = useState(
    initialProduct?.category_id ?? categories[0]?.id ?? ""
  );
  const [price, setPrice] = useState(String(initialProduct?.price ?? ""));
  const [description, setDescription] = useState(
    initialProduct?.description ?? ""
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialProduct?.image_url ?? null
  );
  const [isActive, setIsActive] = useState(initialProduct?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      name,
      slug: slug || slugify(name),
      category_id: categoryId,
      price: Number(price),
      description,
      image_url: imageUrl,
      is_active: isActive,
    };

    const res = await fetch(
      isEdit ? `/api/admin/products/${initialProduct!.id}` : "/api/admin/products",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not save product");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug (used in the product URL)</Label>
        <Input
          id="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline focus:outline-2 focus:outline-brand-100"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="price">Price (INR)</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="1"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="image">Product Image</Label>
        <ImageUploader value={imageUrl} onChange={setImageUrl} />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active (visible in the store)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
      </Button>
    </form>
  );
}
