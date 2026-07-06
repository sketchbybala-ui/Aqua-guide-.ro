"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea, Label } from "@/components/ui/Input";

const MAX_IMAGES = 4;

export function ReviewForm({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setChecking(false);
        return;
      }
      setLoggedIn(true);

      const { data: existing } = await supabase
        .from("reviews")
        .select("id, rating, comment, image_urls")
        .eq("product_id", productId)
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (existing) {
        setExistingId(existing.id);
        setRating(existing.rating);
        setComment(existing.comment ?? "");
        setImages(existing.image_urls ?? []);
      }

      setChecking(false);
    });
  }, [productId]);

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow picking the same file again later
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`You can attach up to ${MAX_IMAGES} photos.`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of files.slice(0, remaining)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/reviews/upload-image", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not upload image");
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload image.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const reviewerName = profile?.full_name || user.email?.split("@")[0] || "Anonymous";

      const { error: upsertError } = await supabase.from("reviews").upsert(
        {
          id: existingId ?? undefined,
          product_id: productId,
          user_id: user.id,
          reviewer_name: reviewerName,
          rating,
          comment: comment.trim() || null,
          image_urls: images,
        },
        { onConflict: "product_id,user_id" }
      );
      if (upsertError) throw upsertError;

      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your review.");
    } finally {
      setSaving(false);
    }
  }

  if (checking) return null;

  if (!loggedIn) {
    return (
      <p className="text-sm text-slate-500">
        <Link href={`/login?next=/products/${productSlug}`} className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>{" "}
        to write a review.
      </p>
    );
  }

  const displayRating = hoverRating || rating;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-900">
        {existingId ? "Update your review" : "Write a review"}
      </h3>

      <div>
        <Label htmlFor="review-rating">Your rating</Label>
        <div id="review-rating" className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              className="p-0.5"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 20 20"
                fill={star <= displayRating ? "#fbbf24" : "#e2e8f0"}
                aria-hidden="true"
              >
                <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.8l-5.2 2.9 1-5.9-4.3-4.1 5.9-.8L10 1.5Z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="review-comment">Your review (optional)</Label>
        <Textarea
          id="review-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think of this product?"
        />
      </div>

      <div>
        <Label htmlFor="review-images">Photos (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {images.map((url) => (
            <div key={url} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200">
              <Image src={url} alt="" fill sizes="64px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                aria-label="Remove photo"
                className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl bg-black/60 text-xs text-white opacity-0 group-hover:opacity-100"
              >
                &times;
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400 hover:border-brand-400 hover:text-brand-600 disabled:opacity-50"
            >
              {uploading ? "…" : "+ Add"}
            </button>
          )}
        </div>
        <input
          id="review-images"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && !error && (
        <p className="text-sm text-green-600">Thanks — your review has been saved.</p>
      )}

      <Button type="submit" disabled={saving || uploading} className="self-start">
        {saving ? "Saving…" : existingId ? "Update Review" : "Submit Review"}
      </Button>
    </form>
  );
}
