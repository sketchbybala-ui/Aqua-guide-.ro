"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import { Logo } from "./Logo";
import { ProfileMenu } from "./ProfileMenu";
import { CartDrawer } from "@/components/cart/CartDrawer";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/home-use", label: "Home Use" },
  { href: "/commercial", label: "Commercial Use" },
];

const CONTACT_PHONE = "9364111117";
const WHATSAPP_QUOTE_LINK =
  "https://wa.me/919489368104?text=" +
  encodeURIComponent("Hi Aqua Guide, I'd like a quote for a water purifier.");

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40">
      {/* top info strip */}
      <div className="hidden bg-brand-900 lg:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-xs text-blue-100">
          <span>Pure Water. Better Life.</span>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <CheckIcon /> Free Installation
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldIcon /> 1 Year Warranty
            </span>
            <span className="flex items-center gap-1.5">
              <HeadsetIcon /> 24/7 Customer Support
            </span>
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className="border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="shrink-0">
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

          <div className="flex items-center gap-2">
            <a
              href={`tel:+91${CONTACT_PHONE}`}
              className="hidden items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-brand-600 lg:flex"
            >
              <PhoneIcon />
              +91 {CONTACT_PHONE}
            </a>

            <a
              href={WHATSAPP_QUOTE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 sm:block"
            >
              Get a Quote
            </a>

            <ProfileMenu />

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

        {/* always-visible category quick links on mobile, so they don't
            depend on the user discovering the hamburger menu */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2.5 md:hidden">
          {navLinks
            .filter((link) => link.href !== "/")
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700"
              >
                {link.label}
              </Link>
            ))}
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
            <a
              href={`tel:+91${CONTACT_PHONE}`}
              className="block py-2 text-sm font-medium text-slate-600 hover:text-brand-600"
            >
              +91 {CONTACT_PHONE}
            </a>
          </nav>
        )}
      </div>

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

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l1.9-1.9c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1C10 20 4 14 4 6.4c0-.6.4-1 1-1h3.1c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2 1.9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12l6 6L20 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 13v-1a8 8 0 1 1 16 0v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="3" y="13" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
