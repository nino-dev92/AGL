import { Link } from "react-router-dom";
import Reveal from "./Reveal";

const points = [
  "Browse players across multiple game titles",
  "Track match history and performance metrics",
  "See tournament placements and achievements",
  "Connect with players and build your network",
];

export default function Players() {
  return (
    <section className="bg-agl-black py-20 md:py-24">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.3em] text-agl-gray">
            TOP COMPETITORS
          </p>
          <h2 className="mt-3 text-[32px] font-black uppercase leading-[1.05] tracking-tight text-agl-white sm:text-5xl lg:text-6xl">
            Meet the players{" "}
            <span className="text-agl-red">defining the scene.</span>
          </h2>

          <p className="mt-6 max-w-xl leading-relaxed text-agl-gray">
            Discover rising talent and seasoned pros across multiple game
            titles. Track their match history, tournament placements, and
            performance stats in real-time.
          </p>

          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 text-sm text-agl-gray"
              >
                <span className="font-bold text-agl-yellow">✓</span>
                {p}
              </li>
            ))}
          </ul>

          <Link
            to="/players"
            className="mt-8 inline-block rounded-agl-sm bg-agl-red px-6 py-3.5 text-sm font-bold text-agl-white transition hover:bg-agl-red-light"
          >
            Explore Players
          </Link>
        </Reveal>

        {/* TODO: replace with real players from your API */}
        <Reveal delay={0.1}>
          <div className="rounded-agl-xl border border-white/15 bg-white/[0.04] p-8 text-center md:p-10">
            <div className="text-4xl">👥</div>
            <h3 className="mt-4 text-lg font-bold text-agl-white">
              No players yet
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-agl-gray">
              Create your profile and join a tournament to appear here.
            </p>
            <Link
              to="/signup"
              className="mt-5 inline-block rounded-agl-sm bg-agl-red px-4 py-2 text-sm font-bold text-agl-white transition hover:bg-agl-red-light"
            >
              Create your account
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}