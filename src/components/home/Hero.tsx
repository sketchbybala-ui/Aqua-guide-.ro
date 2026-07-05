import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";

const WHATSAPP_DEMO_LINK =
  "https://wa.me/919489368104?text=" +
  encodeURIComponent("Hi Aqua Guide, I'd like to request a demo.");

const features = [
  { label: "100% Pure Water", icon: DropIcon },
  { label: "Advanced RO Technology", icon: FilterIcon },
  { label: "Healthy & Safe", icon: HeartIcon },
  { label: "Easy Installation", icon: WrenchIcon },
];

const specBadges = [
  { label: "Multi Stage Purification", icon: LayersIcon },
  { label: "UV Protection", icon: ShieldIcon },
  { label: "TDS Control", icon: GaugeIcon },
];

export function Hero({ heroImageUrl }: { heroImageUrl: string | null }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-100 via-brand-50 to-white">
      {/* decorative background: soft glows + dot texture */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-brand-300/30 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.35]" aria-hidden="true">
          <defs>
            <pattern id="hero-dots" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="#93c5fd" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-slate-900">Pure Water.</span>
            <br />
            <span className="text-brand-600">Better Life.</span>
          </h1>
          <p className="max-w-lg text-base text-slate-600">
            Aqua Guide brings you advanced RO water purifiers that ensure
            100% pure, safe and healthy drinking water for your family and
            business.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            {features.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3.5 text-xs font-medium text-slate-700 shadow-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Icon />
                </span>
                {label}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <LinkButton href="/home-use">Explore Products &rarr;</LinkButton>
            <LinkButton href={WHATSAPP_DEMO_LINK} variant="secondary">
              Request a Demo &rarr;
            </LinkButton>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="absolute inset-x-6 bottom-4 top-10 -z-10 rounded-full bg-brand-200/60 blur-2xl" />
          <div className="relative mx-auto flex aspect-square w-full max-w-[340px] items-center justify-center rounded-full bg-white/70 shadow-inner">
            {heroImageUrl && (
              <div className="relative h-[85%] w-[85%]">
                <Image
                  src={heroImageUrl}
                  alt="Aqua Guide RO water purifier"
                  fill
                  sizes="340px"
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
            )}
          </div>

          <div className="mt-6 hidden flex-col items-end gap-3 sm:flex lg:absolute lg:-right-4 lg:top-1/2 lg:mt-0 lg:-translate-y-1/2 xl:-right-10">
            {specBadges.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 shadow-lg ring-1 ring-slate-100"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Icon />
                </span>
                <span className="text-xs font-medium text-slate-700">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* wave divider flowing into the stats bar below */}
      <svg
        className="relative block w-full text-brand-900"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 40c120 24 240 24 360 8s240-24 360-8 240 24 360 8 240-24 360-8v40H0Z"
          fill="currentColor"
        />
      </svg>
    </section>
  );
}

function DropIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5c3.5 4.2 6.5 8.1 6.5 11.6a6.5 6.5 0 1 1-13 0c0-3.5 3-7.4 6.5-11.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4h16l-6 8v6l-4 2v-8L4 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.6-9.5 9-9.5 9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.7 6.3a4 4 0 0 0-5.4 5l-6 6 2 2 6-6a4 4 0 0 0 5-5.4l-2.6 2.6-2-2 2.6-2.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l9 5-9 5-9-5 9-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GaugeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 15a8 8 0 1 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 15l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
