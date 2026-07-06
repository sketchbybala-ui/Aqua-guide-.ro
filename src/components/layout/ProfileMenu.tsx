"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ProfileMenu() {
  const [user, setUser] = useState<{
    email: string | null;
    name: string | null;
    isAdmin: boolean;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function loadUser(userId: string, email: string | null) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, is_admin")
        .eq("id", userId)
        .single();
      setUser({ email, name: profile?.full_name ?? null, isAdmin: profile?.is_admin ?? false });
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) loadUser(data.user.id, data.user.email ?? null);
      else setUser(null);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadUser(session.user.id, session.user.email ?? null);
      else setUser(null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Log in"
        className="rounded-lg p-2 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
      >
        <ProfileIcon />
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        aria-label="Open profile menu"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
      >
        <ProfileIcon />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-100 bg-white py-2 shadow-lg">
          <div className="border-b border-slate-100 px-4 py-2">
            <p className="truncate text-sm font-medium text-slate-900">
              {user.name || "My Account"}
            </p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600"
          >
            My Profile
          </Link>
          <Link
            href="/account/orders"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600"
          >
            Order History
          </Link>
          {user.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-600"
            >
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M4.5 19.5c1.4-3.4 4.4-5.2 7.5-5.2s6.1 1.8 7.5 5.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
