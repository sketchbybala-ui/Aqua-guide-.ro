"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Textarea, Label } from "@/components/ui/Input";

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
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
        .select("id, rating, comment")
        .eq("product_id", productId)
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (existing) {
        setExistingId(existing.id);
        setRating(existing.rating);
        setComment(existing.comment ?? "");
      }

      setChecking(false);
    });
  }, [productId]);

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

      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && !error && (
        <p className="text-sm text-green-600">Thanks — your review has been saved.</p>
      )}

      <Button type="submit" disabled={saving} className="self-start">
        {saving ? "Saving…" : existingId ? "Update Review" : "Submit Review"}
      </Button>
    </form>
  );
}
