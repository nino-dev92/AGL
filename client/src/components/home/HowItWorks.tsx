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
    <section
      id="how"
      className="scroll-mt-20 border-b border-agl-border bg-agl-black-soft py-section-sm"
    >
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <Reveal>
          <SectionHeading eyebrow="GET STARTED IN MINUTES" title="How It Works" />
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="relative h-full overflow-hidden rounded-agl-lg border border-agl-border bg-agl-card p-6">
                <span className="absolute -right-2 -top-4 font-display text-7xl text-agl-surface-hover">
                  0{i + 1}
                </span>
                <div className="relative">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-agl-lime font-display text-sm text-agl-black">
                    {i + 1}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-agl-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-agl-gray">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
