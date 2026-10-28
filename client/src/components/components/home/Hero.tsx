import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const stats = [
  { value: "250+", label: "PLAYERS" },
  { value: "5+", label: "TOURNAMENTS" },
  { value: "120+", label: "MATCHES" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-agl-border bg-agl-black">
      {/* Photo background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.35) 100%), url('/Herobg.jpg')",
        }}
      />

      <div className="relative mx-auto max-w-[1280px] px-4 py-16 md:px-6 md:py-28 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <p className="font-orbitron text-7xl font-black leading-none text-agl-red md:text-8xl">
            AGL
          </p>

          <span className="mt-6 inline-block rounded-full border border-agl-yellow bg-agl-black/40 px-4 py-1.5 text-xs font-semibold text-agl-yellow">
            Mobile gaming tournaments
          </span>

          <h1 className="mt-6 text-[38px] font-black uppercase leading-[1.05] tracking-tight text-agl-white sm:text-6xl lg:text-7xl xl:text-8xl">
            <span className="block">Compete at the</span>
            <span className="block">
              <span className="text-agl-yellow">next</span>
              <span className="text-agl-red">level.</span>
            </span>
          </h1>

          <p className="mt-6 text-xl font-bold text-agl-white md:text-2xl">
            Play. Watch. Stake. Win.
          </p>
          <p className="mt-3 max-w-xl text-[18px] leading-relaxed text-agl-gray">
            The African Global League — one platform for mobile tournaments,
            gaming communities, live competition and player-powered rewards.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
            <Link
              to="/tournaments"
              className="w-56 rounded-agl-sm bg-agl-red py-3 text-center text-sm font-bold text-agl-white shadow-agl-glow transition hover:bg-agl-red-light hover:shadow-agl-glow-strong"
            >
              Explore Tournaments
            </Link>
            <a
              href="#watch"
              className="w-56 rounded-agl-sm border border-agl-border-white py-3 text-center text-sm font-semibold text-agl-white transition hover:border-agl-red hover:text-agl-red"
            >
              Watch Now
            </a>
          </div>
        </motion.div>

        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:flex sm:gap-12">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col-reverse border-l-2 border-agl-red pl-4"
            >
              <dt className="mt-1 text-[11px] tracking-widest text-agl-white">
                {s.label}
              </dt>
              <dd className="text-[34px] font-bold text-agl-white md:text-4xl">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}