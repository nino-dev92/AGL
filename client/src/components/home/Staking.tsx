import { Link } from "react-router-dom";
import Reveal from "./Reveal";

const cards = [
  {
    icon: "🎯",
    title: "Back a player",
    text: "Pick a registered player you believe in before registration closes.",
  },
  {
    icon: "💰",
    title: "Stake your support",
    text: "Stake any amount within the tournament limits. Change your mind? Cancel before it locks.",
  },
  {
    icon: "🏆",
    title: "Share the rewards",
    text: "If your player wins, backers split the staking pool (minus a 10% fee).",
  },
  {
    icon: "🛡️",
    title: "Fair & transparent",
    text: "Payouts are settled from official AGL results. No winner backed? Everyone is refunded.",
  },
];

export default function Staking() {
  return (
    <section className="bg-agl-black py-20 md:py-24">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <Reveal className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold tracking-[0.3em]">
              <span className="h-2 w-2 rounded-full bg-agl-red" />
              <span className="text-agl-white">LIVE</span>
              <span className="text-agl-yellow">STAKING</span>
            </p>
            <h2 className="mt-3 text-[32px] font-black uppercase leading-[1.05] tracking-tight text-agl-white sm:text-5xl lg:text-6xl">
              Back the players{" "}
              <span className="text-agl-yellow">you believe in.</span>
            </h2>
          </div>

          <Link
            to="/staking"
            className="rounded-agl-sm bg-agl-red px-6 py-3.5 text-sm font-bold text-agl-white transition hover:bg-agl-red-light"
          >
            Start staking
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div className="h-full rounded-agl-lg border border-white/15 bg-white/[0.04] p-6">
                <div className="text-2xl">{c.icon}</div>
                <h3 className="mt-5 text-lg font-bold text-agl-white">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-agl-gray">
                  {c.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}