import Image from "next/image";
import { StarRating } from "@/components/ui/StarRating";
import type { Review } from "@/lib/types";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No reviews yet — be the first to share your experience.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-5">
      {reviews.map((review) => (
        <li key={review.id} className="border-b border-slate-100 pb-5 last:border-b-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-900">{review.reviewer_name}</span>
            <span className="text-xs text-slate-400">
              {new Date(review.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </span>
          </div>
          <StarRating rating={review.rating} size={14} className="mt-1" />
          {review.comment && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.comment}</p>
          )}
          {review.image_urls.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {review.image_urls.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative h-32 w-32 overflow-hidden rounded-lg border border-slate-200"
                >
                  <Image src={url} alt="" fill sizes="128px" className="object-cover" />
                </a>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
