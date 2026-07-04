import { LinkButton } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="bg-brand-50">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 sm:py-28">
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-700 shadow-sm">
          Pure Water. Healthy Life.
        </span>
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Water purifiers built for every home and business
        </h1>
        <p className="max-w-lg text-base text-slate-600">
          From compact RO systems for your kitchen to high-capacity plants for
          commercial use, Aqua Guide helps you find clean drinking water
          solutions you can trust.
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/home-use">Shop Home Use</LinkButton>
          <LinkButton href="/commercial" variant="secondary">
            Shop Commercial Use
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
