import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Watch() {
  return (
    <section
      id="watch"
      className="scroll-mt-20 border-b border-agl-border bg-agl-black-soft py-section-sm"
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <Reveal>
          <SectionHeading eyebrow="LATEST STREAMS" title="Watch AGL" />
        </Reveal>

        <Reveal delay={0.1} className="mt-10 max-w-3xl">
          <article className="overflow-hidden rounded-agl-xl border border-agl-border bg-agl-card">
            {/* Swap this gradient for a real thumbnail: <img src="/images/stream-1.jpg" /> */}
            <div className="relative aspect-video bg-agl-dark-gradient">
              <div className="absolute inset-0 " />
              <span className="absolute left-4 top-4 flex items-center gap-2 rounded bg-agl-danger px-3 py-1 text-xs font-bold text-agl-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-agl-white" />
                LIVE
              </span>
              <span className="absolute right-4 top-4 rounded bg-agl-black/70 px-3 py-1 text-xs text-agl-white">
                12,480 watching
              </span>
              <div className="absolute inset-0 grid place-items-center">
                <span className="grid h-16 w-16 place-items-center rounded-full pl-1 text-2xl text-agl-black shadow-agl-glow-strong">
                  ▶
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <h3 className="font-display text-xl uppercase text-agl-white">
                  Road to Finals — Competitive
                </h3>
                <p className="mt-1 text-sm text-agl-gray">
                  Nexus · CODM · Nightfall Championship
                </p>
              </div>
              <a
                href="#watch"
                className="text-sm font-semibold text-agl-red hover:text-agl-lime-red"
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
