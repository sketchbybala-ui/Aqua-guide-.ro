// A stylized, animated illustration of an RO purifier for the hero section:
// dripping water, a filling glass with ripples, and a pulsing "active"
// status light. Pure SVG + CSS animations (see globals.css) — no images,
// no animation library.
export function RoMachineAnimation({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 380" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ro-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#eaf2ff" />
        </linearGradient>
        <linearGradient id="ro-cartridge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="ro-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>

      {/* floor shadow */}
      <ellipse cx="150" cy="368" rx="95" ry="11" fill="#0f172a" opacity="0.06" />

      {/* purifier body */}
      <rect x="55" y="60" width="150" height="220" rx="20" fill="url(#ro-body)" stroke="#dbeafe" strokeWidth="2" />

      {/* head unit + status light */}
      <path d="M55 80a20 20 0 0 1 20-20h110a20 20 0 0 1 20 20v26H55V80Z" fill="#2563eb" />
      <circle cx="77" cy="83" r="5" fill="#ffffff" className="animate-ro-pulse" />
      <rect x="93" y="78" width="42" height="10" rx="5" fill="#ffffff" opacity="0.7" />

      {/* filter window */}
      <rect x="73" y="122" width="114" height="100" rx="10" fill="#f8fbff" stroke="#dbeafe" strokeWidth="2" />
      <rect x="87" y="133" width="20" height="78" rx="10" fill="url(#ro-cartridge)" />
      <rect x="115" y="133" width="20" height="78" rx="10" fill="url(#ro-cartridge)" opacity="0.85" />
      <rect x="143" y="133" width="20" height="78" rx="10" fill="url(#ro-cartridge)" opacity="0.7" />

      {/* spout, attached to the bottom of the body */}
      <path
        d="M130 280v14a10 10 0 0 0 10 10h10a10 10 0 0 1 10 10v6"
        fill="none"
        stroke="#2563eb"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* dripping droplets */}
      <circle cx="160" cy="324" r="3.2" fill="#3b82f6" className="animate-ro-drip" />
      <circle cx="160" cy="324" r="3.2" fill="#3b82f6" className="animate-ro-drip" style={{ animationDelay: "0.6s" }} />
      <circle cx="160" cy="324" r="3.2" fill="#3b82f6" className="animate-ro-drip" style={{ animationDelay: "1.2s" }} />

      {/* glass */}
      <path d="M144 358v-30h32v30a5 5 0 0 1-5 5h-22a5 5 0 0 1-5-5Z" fill="#ffffff" stroke="#93c5fd" strokeWidth="2" />
      <path d="M146 346h28v12a5 5 0 0 1-5 5h-18a5 5 0 0 1-5-5v-12Z" fill="url(#ro-water)" />

      {/* ripples on the water surface */}
      <ellipse cx="160" cy="346" rx="13" ry="3" fill="none" stroke="#2563eb" strokeWidth="1.4" className="animate-ro-ripple" />
      <ellipse cx="160" cy="346" rx="13" ry="3" fill="none" stroke="#2563eb" strokeWidth="1.4" className="animate-ro-ripple" style={{ animationDelay: "0.9s" }} />
    </svg>
  );
}
