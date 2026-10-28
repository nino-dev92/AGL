import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const steps = [
  {
    title: "Choose Your Game",
    text: "Pick from CODM, Free Fire, PUBG Mobile and eFootball and find your arena.",
  },
  {
    title: "Join a Tournament",
    text: "Enter competitions matching your skill and region.",
  },
  {
    title: "Compete & Climb",
    text: "Battle through brackets and rise the rankings.",
  },
  {
    title: "Earn Rewards",
    text: "Win prize pools, unlock achievements, and climb tiers.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-agl-black py-20 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <Reveal>
          <SectionHeading eyebrow="GET STARTED IN MINUTES" title="How It Works" />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="h-full rounded-agl-lg border border-white/15 bg-white/[0.04] p-6">
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-agl-red text-sm font-bold text-agl-white">
                    {i + 1}
                  </div>
                  <span className="font-display text-5xl leading-none text-white/10">
                    0{i + 1}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold text-agl-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-agl-gray">
                  {s.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}