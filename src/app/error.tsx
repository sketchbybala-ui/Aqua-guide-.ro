"use client";

import { LinkButton } from "@/components/ui/Button";

export default function ErrorBoundary({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Something went wrong
      </h1>
      <p className="text-sm text-slate-500">
        Please try again, or head back to the homepage. If this keeps
        happening, the site may not be fully configured yet.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Try Again
        </button>
        <LinkButton href="/" variant="secondary">
          Go Home
        </LinkButton>
      </div>
    </section>
  );
}
