import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const stats = [
  { value: "250+", label: "PLAYERS" },
  { value: "5+", label: "TOURNAMENTS" },
  { value: "120+", label: "MATCHES" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-agl-border">
      <div className="pointer-events-none absolute inset-0 bg-agl-radial" />

      <div
        className="relative mx-auto max-w-[1280px] bg-cover bg-center px-4 py-20 md:px-6 md:py-32"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/Herobg.jpg')",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-agl-border-yellow bg-agl-surface px-4 py-1.5 text-xs font-semibold tracking-widest text-agl-yellow">
            MOBILE GAMING TOURNAMENTS
          </span>

          <h1 className="mt-6 font-display text-hero uppercase text-agl-white lg:text-hero-xl">
            Compete at the <span className="text-agl-yellow text-hero-lg lg:text-hero-xl">next</span><span className="text-agl-red text-hero-lg lg:text-hero-xl">level.</span>
          </h1>

          <p className="mt-4 text-2xl font-bold tracking-wide text-agl-white">
            Play. Watch. Stake. Win.
          </p>
          <p className="mt-3 max-w-xl text-agl-gray text-[18px]">
            The African Global League — one platform for mobile tournaments,
            gaming communities, live competition and player-powered rewards.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
            <Link
              to="/tournaments"
              className="rounded-agl-sm bg-agl-red w-49 py-3 text-sm text-center font-bold text-agl-white shadow-agl-glow transition hover:bg-agl-red-light hover:shadow-agl-glow-strong"
            >
              Explore Tournaments
            </Link>
            <a
              href="#watch"
              className="rounded-agl-sm border border-agl-border-white px-6 py-3 text-sm font-semibold text-agl-white transition hover:border-agl-red hover:text-agl-red"
            >
              Watch Now
            </a>
          </div>
        </motion.div>

        <dl className="mt-16 grid max-w-xl grid-cols-2 gap-x-6 gap-y-8 pt-8 sm:grid-cols-3 sm:gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col-reverse border-l-2 border-agl-red pl-4"
            >
              <dt className="mt-1 text-[11px] tracking-widest text-agl-white">
                {s.label}
              </dt>
              <dd className="font-display text-[34px] text-agl-white md:text-4xl">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

