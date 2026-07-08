import { AnimatedWaves } from "./AnimatedWaves";
import { Bubbles } from "./Bubbles";
import { Fish, Seaweed, Coral, Starfish, Whale } from "./SeaLife";

const highlights = [
  { title: "Sourced Responsibly", text: "Every purifier is built to protect the water we all share." },
  { title: "Purified in Stages", text: "Multi-stage RO + UV filtration, engineered for real results." },
  { title: "Delivered with Care", text: "From our team to your tap — pure water, better life." },
];

// A decorative, indigo-toned "deep ocean" interlude on the homepage —
// bubbles, drifting fish, swaying seaweed, and coral, bookended by the
// same animated-wave transition used elsewhere on the site.
export function OceanSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-900 to-indigo-700">
      <AnimatedWaves color="#ffffff" flip height={80} />

      <div className="relative py-16">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <Bubbles tone="onBlue" />

          {/* Whale's swim (translate) animation lives on this wrapper, same
              reasoning as the fish below — keeps it separate from Whale's
              own flip (scaleX) transform on its inner <svg>. Large and
              faint, drifting slowly behind everything else. */}
          <div className="animate-whale absolute left-[2%] top-[8%] h-16 w-28 opacity-40 sm:h-20 sm:w-36">
            <Whale className="h-full w-full" color="#a5b4fc" />
          </div>

          {/* Each fish's swim (translate) animation lives on this wrapper,
              separate from Fish's own flip (scaleX) transform on its inner
              <svg> — keeping them on different elements means neither
              transform overwrites the other. */}
          <div className="animate-fish absolute left-[8%] top-[18%] h-8 w-14 opacity-80" style={{ animationDelay: "0s" }}>
            <Fish className="h-full w-full" />
          </div>
          <div className="animate-fish absolute right-[12%] top-[30%] h-6 w-11 opacity-70" style={{ animationDelay: "1.5s" }}>
            <Fish className="h-full w-full" flip />
          </div>
          <div className="animate-fish absolute left-[22%] top-[55%] h-5 w-9 opacity-60" style={{ animationDelay: "3s" }}>
            <Fish className="h-full w-full" />
          </div>
          <div className="animate-fish absolute right-[26%] top-[65%] h-7 w-12 opacity-70" style={{ animationDelay: "4.2s" }}>
            <Fish className="h-full w-full" flip />
          </div>

          <Seaweed className="animate-seaweed absolute bottom-0 left-[6%]" height={130} />
          <Seaweed className="animate-seaweed absolute bottom-0 left-[10%]" height={90} color="#14b8a6" style={{ animationDelay: "0.6s" }} />
          <Seaweed className="animate-seaweed absolute bottom-0 right-[8%]" height={150} style={{ animationDelay: "1.2s" }} />
          <Seaweed className="animate-seaweed absolute bottom-0 right-[13%]" height={100} color="#14b8a6" style={{ animationDelay: "0.3s" }} />

          <Coral className="absolute bottom-2 left-[36%] h-14 w-16" />
          <Coral className="absolute bottom-2 right-[34%] h-10 w-12" color="#fdba74" />
          <Starfish className="absolute bottom-6 left-[48%] h-8 w-8" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-200">
            Our Promise
          </span>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Every Drop Starts in the Deep
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-100">
            Water is precious — from the ocean to your glass. Here&apos;s how we
            keep that promise.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="rounded-2xl bg-white/10 p-5 text-left backdrop-blur-sm"
              >
                <h3 className="text-sm font-semibold text-white">{h.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-indigo-100">
                  {h.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatedWaves color="#ffffff" height={80} />
    </section>
  );
}
