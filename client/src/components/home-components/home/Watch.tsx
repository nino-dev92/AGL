import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Watch() {
  return (
    <section id="watch" className="scroll-mt-20 bg-agl-black py-20 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <Reveal>
          <SectionHeading eyebrow="LATEST STREAMS" title="Watch AGL" />
        </Reveal>

        <Reveal delay={0.1} className="mt-10 max-w-md">
          <article className="overflow-hidden rounded-agl-xl border border-white/15 bg-white/[0.04]">
            {/* Thumbnail */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src="/stream-1.jpg.svg"
                alt="Road to Finals live stream"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-agl-black/70 via-transparent to-transparent" />

              <span className="absolute left-3 top-3 rounded bg-agl-red px-2.5 py-1 text-xs font-bold text-agl-white">
                LIVE
              </span>

              <span className="absolute bottom-3 left-3 flex items-center gap-2 text-xs font-semibold text-agl-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-agl-red" />
                12,480 watching
              </span>
            </div>

            {/* Details */}
            <div className="p-5 md:p-6">
              <h3 className="text-lg font-black uppercase leading-snug text-agl-white md:text-xl">
                Road to Finals — Competitive
              </h3>
              <p className="mt-2 text-sm text-agl-gray">
                Nexus · CODM · Nightfall Championship
              </p>
              <a
                href="#watch"
                className="mt-4 inline-block text-sm font-bold text-agl-red transition-colors hover:text-agl-red-light"
              >
                Watch Now →
              </a>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}