"use client";

// Catches errors thrown by the root layout itself (rare) — must render its
// own <html>/<body> since it replaces the entire root layout when active.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-slate-500">
          Please try again, or the site may not be fully configured yet.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
