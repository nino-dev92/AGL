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
    <section className="border-b border-agl-border py-section-sm">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-3 text-xs font-bold tracking-[0.3em] text-agl-lime">
              STAKING
              <span className="rounded bg-agl-danger px-2 py-0.5 text-[10px] tracking-widest text-agl-white">
                LIVE
              </span>
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-agl-white md:text-section">
              Back the players you believe in.
            </h2>
          </div>
          <Link
            to="/staking"
            className="rounded-agl-sm bg-agl-lime px-6 py-3 text-sm font-bold text-agl-black transition hover:bg-agl-lime-light"
          >
            Start staking
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div className="h-full rounded-agl-lg border border-agl-border bg-agl-card p-6">
                <div className="text-3xl">{c.icon}</div>
                <h3 className="mt-4 text-lg font-bold text-agl-white">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm text-agl-gray">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
