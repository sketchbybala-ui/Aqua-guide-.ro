"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export function WelcomeBonusModalClient({
  code,
  discountPercent,
}: {
  code: string;
  discountPercent: number;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // Only pop up right after the login/signup redirect (marked with
    // ?welcome=1) — not on every ordinary page load while the coupon is
    // still unredeemed, which would get old fast.
    if (searchParams.get("welcome") !== "1") return;

    setOpen(true);

    // Strip the marker so a refresh (or navigating back) doesn't re-trigger
    // the popup. Uses the native History API directly rather than
    // router.replace() — a search-param-only replace() on the same route
    // doesn't reliably update the visible URL in this Next.js version,
    // since it skips an RSC re-fetch and (apparently) the URL bar update
    // that would normally come with it.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("welcome");
    const query = params.toString();
    const target = `${pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState(window.history.state, "", target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!open) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — the code is still visible to copy by hand
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-3xl">
          🎉
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Welcome to Aqua Guide!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Here&apos;s a gift for joining us — {discountPercent}% off your first order.
        </p>

        <button
          onClick={handleCopy}
          className="mt-5 flex w-full items-center justify-between rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 px-4 py-3"
        >
          <span className="font-mono text-lg font-bold tracking-wider text-brand-700">
            {code}
          </span>
          <span className="text-xs font-semibold text-brand-600">
            {copied ? "Copied!" : "Tap to copy"}
          </span>
        </button>

        <Link
          href="/home-use"
          onClick={() => setOpen(false)}
          className="mt-5 block w-full rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Shop Now &rarr;
        </Link>
      </div>
    </div>
  );
}
