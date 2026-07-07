// Decorative rising bubbles for the aquatic theme. Purely visual:
// pointer-events disabled, hidden from screen readers, and the animation
// is turned off entirely under prefers-reduced-motion (see globals.css).
const BUBBLES = [
  { left: "5%", size: 14, delay: 0, duration: 11 },
  { left: "14%", size: 8, delay: 3.2, duration: 9 },
  { left: "26%", size: 11, delay: 1.4, duration: 12 },
  { left: "38%", size: 7, delay: 5.1, duration: 10 },
  { left: "52%", size: 13, delay: 2.3, duration: 11.5 },
  { left: "64%", size: 9, delay: 6.4, duration: 9.5 },
  { left: "76%", size: 12, delay: 0.8, duration: 12.5 },
  { left: "88%", size: 8, delay: 4.2, duration: 10.5 },
  { left: "95%", size: 10, delay: 7.3, duration: 11 },
];

export function Bubbles({ tone = "light" }: { tone?: "light" | "onBlue" }) {
  const bubbleClasses =
    tone === "light"
      ? "border-brand-300/60 bg-brand-200/30"
      : "border-white/40 bg-white/10";

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {BUBBLES.map((bubble, i) => (
        <span
          key={i}
          className={`animate-bubble absolute rounded-full border ${bubbleClasses}`}
          style={{
            left: bubble.left,
            bottom: -(bubble.size + 12),
            width: bubble.size,
            height: bubble.size,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
