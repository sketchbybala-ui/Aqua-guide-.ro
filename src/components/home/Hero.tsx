import { LinkButton } from "@/components/ui/Button";
import { RoMachineAnimation } from "./RoMachineAnimation";

export function Hero() {
  return (
    <section className="overflow-hidden bg-gradient-to-b from-brand-50 to-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-700 shadow-sm">
            Pure Water. Healthy Life.
          </span>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Water purifiers built for every home and business
          </h1>
          <p className="max-w-lg text-base text-slate-600">
            From compact RO systems for your kitchen to high-capacity plants
            for commercial use, Aqua Guide helps you find clean drinking
            water solutions you can trust.
          </p>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/home-use">Shop Home Use</LinkButton>
            <LinkButton href="/commercial" variant="secondary">
              Shop Commercial Use
            </LinkButton>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="absolute inset-0 -z-10 rounded-full bg-brand-100/60 blur-3xl" />
          <RoMachineAnimation className="w-full" />
        </div>
      </div>
    </section>
  );
}
