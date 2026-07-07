import Link from "next/link";
import { LogoMark } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 bg-brand-900">
      {/* wave divider: the white page above dips into the dark footer */}
      <svg
        className="block w-full text-white"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 40c120 24 240 24 360 8s240-24 360-8 240 24 360 8 240-24 360-8V0H0Z"
          fill="currentColor"
        />
      </svg>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <span className="inline-flex items-center gap-2.5">
              <LogoMark className="h-8 w-auto" />
              <span className="text-lg font-bold tracking-tight text-white">
                Aqua<span className="text-brand-200">Guide</span>
              </span>
            </span>
            <p className="mt-3 max-w-xs text-sm text-blue-100/80">
              Water purifiers for every home and business. Pure water,
              healthy life.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-200">
              Quick Links
            </h3>
            <nav className="mt-3 flex flex-col gap-2 text-sm text-blue-100">
              <Link href="/home-use" className="hover:text-white">
                Home Use
              </Link>
              <Link href="/commercial" className="hover:text-white">
                Commercial Use
              </Link>
              <Link href="/account/orders" className="hover:text-white">
                Track Orders
              </Link>
              <a
                href="https://wa.me/919489368104?text=Hi%20Aqua%20Guide%2C%20I%20need%20help%20with%20a%20water%20purifier."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                Customer Care (WhatsApp)
              </a>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-200">
              Contact Us
            </h3>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm text-blue-100">
              <li className="flex items-start gap-2.5">
                <MailIcon />
                <a href="mailto:aquaguidebala@gmail.com" className="hover:text-white">
                  aquaguidebala@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <PhoneIcon />
                <a href="tel:+919364111117" className="hover:text-white">
                  +91 93641 11117
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <PinIcon />
                <span>
                  Kannan Milk, Opposite Salem Main Road, Komarapalayam,
                  Namakkal &ndash; 638183
                </span>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-blue-200/70">
          &copy; {new Date().getFullYear()} Aqua Guide. Pure water, healthy
          life.
        </p>
      </div>
    </footer>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 6.5l8 6.5 8-6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
      <path
        d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l1.9-1.9c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1C10 20 4 14 4 6.4c0-.6.4-1 1-1h3.1c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2 1.9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
      <path
        d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
