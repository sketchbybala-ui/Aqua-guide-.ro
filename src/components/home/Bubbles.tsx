// Decorative rising bubbles for the aquatic theme. Purely visual:
// pointer-events disabled, hidden from screen readers, and the animation
// is turned off entirely under prefers-reduced-motion (see globals.css).
const BUBBLES = [
  { left: "4%", size: 26, delay: 0, duration: 11 },
  { left: "12%", size: 14, delay: 3.2, duration: 9 },
  { left: "21%", size: 20, delay: 1.4, duration: 12 },
  { left: "33%", size: 11, delay: 5.1, duration: 10 },
  { left: "44%", size: 28, delay: 2.3, duration: 11.5 },
  { left: "55%", size: 16, delay: 6.4, duration: 9.5 },
  { left: "66%", size: 22, delay: 0.8, duration: 12.5 },
  { left: "77%", size: 13, delay: 4.2, duration: 10.5 },
  { left: "86%", size: 24, delay: 7.3, duration: 11 },
  { left: "94%", size: 15, delay: 2.9, duration: 10 },
];

export function Bubbles({ tone = "light" }: { tone?: "light" | "onBlue" }) {
  // Glassy bubble: a highlight in the upper-left fading to a translucent
  // tinted body, ringed by a soft border — reads as a real air bubble
  // rising through water rather than a flat dot.
  const isLight = tone === "light";
  const border = isLight ? "1px solid rgba(96,165,250,0.7)" : "1px solid rgba(255,255,255,0.65)";
  const gradient = isLight
    ? "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9) 0%, rgba(147,197,253,0.5) 40%, rgba(59,130,246,0.15) 100%)"
    : "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 42%, rgba(255,255,255,0.08) 100%)";

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {BUBBLES.map((bubble, i) => (
        <span
          key={i}
          className="animate-bubble absolute rounded-full"
          style={{
            left: bubble.left,
            bottom: -(bubble.size + 12),
            width: bubble.size,
            height: bubble.size,
            background: gradient,
            border,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
