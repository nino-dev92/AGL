import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const stats = [
  { value: "250+", label: "PLAYERS" },
  { value: "5+", label: "TOURNAMENTS" },
  { value: "120+", label: "MATCHES" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-agl-border bg-size-[40px_40px]"  >
      <div className="pointer-events-none absolute inset-0 bg-agl-radial" />

      <div className="relative mx-auto max-w-[1280px] px-4 py-20 md:px-6 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-agl-border-light bg-agl-surface px-4 py-1.5 text-xs font-semibold tracking-widest text-agl-gray-light">
            <span className="h-2 w-2 rounded-full bg-agl-lime" />
            AGL · MOBILE GAMING TOURNAMENTS
          </span>

          <h1 className="mt-6 font-display text-hero-sm uppercase text-agl-white md:text-hero lg:text-hero-lg">
            Compete at the <span className="text-agl-lime">next level.</span>
          </h1>

          <p className="mt-4 text-lg font-bold tracking-wide text-agl-white">
            Play. Watch. Stake. Win.
          </p>
          <p className="mt-3 max-w-xl text-agl-gray">
            The African Global League — one platform for mobile tournaments,
            gaming communities, live competition and player-powered rewards.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/tournaments"
              className="rounded-agl-sm bg-agl-lime px-6 py-3 text-sm font-bold text-agl-black shadow-agl-glow transition hover:bg-agl-lime-light hover:shadow-agl-glow-strong"
            >
              Explore Tournaments
            </Link>
            <a
              href="#watch"
              className="rounded-agl-sm border border-agl-border-light px-6 py-3 text-sm font-semibold text-agl-white transition hover:border-agl-lime hover:text-agl-lime"
            >
              Watch Now
            </a>
          </div>
        </motion.div>

        <dl className="mt-16 grid max-w-xl grid-cols-3 gap-6 border-t border-agl-border pt-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-xs tracking-widest text-agl-gray">
                {s.label}
              </dt>
              <dd className="font-display text-3xl text-agl-lime md:text-4xl">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
