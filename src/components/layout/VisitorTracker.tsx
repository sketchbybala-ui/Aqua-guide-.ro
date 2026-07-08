"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Fires a fire-and-forget beacon on every route change (initial load +
// client-side navigations) to log a page view. Never blocks rendering and
// never surfaces an error to the user if it fails.
export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip the admin section itself so browsing your own dashboard doesn't
    // pollute the visitor stats you're looking at.
    if (pathname.startsWith("/admin")) return;

    const body = JSON.stringify({ path: pathname });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track-visit",
        new Blob([body], { type: "application/json" })
      );
    } else {
      fetch("/api/track-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
