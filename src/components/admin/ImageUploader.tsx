"use client";

import { useState } from "react";
import Image from "next/image";

export function ImageUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload-image", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      return;
    }

    onChange(data.url);
  }

  return (
    <div className="flex flex-col gap-3">
      {value && (
        <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-slate-50">
          <Image src={value} alt="Product" fill className="object-cover" />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={uploading}
        className="text-sm text-slate-600"
      />
      {uploading && <p className="text-xs text-slate-400">Uploading…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
