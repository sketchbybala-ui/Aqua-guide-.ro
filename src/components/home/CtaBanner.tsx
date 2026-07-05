const WHATSAPP_QUOTE_LINK =
  "https://wa.me/919489368104?text=" +
  encodeURIComponent("Hi Aqua Guide, I'd like a quote for a water purifier.");
const WHATSAPP_EXPERT_LINK =
  "https://wa.me/919489368104?text=" +
  encodeURIComponent("Hi Aqua Guide, I'd like to talk to an expert.");

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-12 sm:px-14">
        <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col items-start gap-5">
          <h2 className="max-w-lg text-2xl font-bold text-white sm:text-3xl">
            Ready to Experience Pure Water?
          </h2>
          <p className="max-w-md text-sm text-blue-100">
            Get the best water purifier for your home or business.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={WHATSAPP_QUOTE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-blue-50"
            >
              Get a Quote
            </a>
            <a
              href={WHATSAPP_EXPERT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/60 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Talk to Expert
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
