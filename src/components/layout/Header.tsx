"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart/cart-context";
import { Logo } from "./Logo";
import { CartDrawer } from "@/components/cart/CartDrawer";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/home-use", label: "Home Use" },
  { href: "/commercial", label: "Commercial Use" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => setIsLoggedIn(!!session?.user)
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={isLoggedIn ? "/account" : "/login"}
            className="hidden text-sm font-medium text-slate-600 hover:text-brand-600 sm:block"
          >
            {isLoggedIn ? "My Account" : "Login"}
          </Link>

          <button
            aria-label="Open cart"
            onClick={() => setCartOpen(true)}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                {count}
              </span>
            )}
          </button>

          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-600 hover:bg-brand-50 md:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-600 hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={isLoggedIn ? "/account" : "/login"}
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-600 hover:text-brand-600"
          >
            {isLoggedIn ? "My Account" : "Login"}
          </Link>
        </nav>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="21" r="1.4" fill="currentColor" />
      <circle cx="17" cy="21" r="1.4" fill="currentColor" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
