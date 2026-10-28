import { Link } from "react-router-dom";
import Reveal from "./Reveal";

const games = [
  { id: "codm", short: "CODM", name: "Call of Duty: Mobile", image: "/public/Call of Duty_ Mobile.svg" },
  { id: "ff", short: "FF", name: "Free Fire", image: "/public/Freefire.svg" },
  { id: "pubgm", short: "PUBG M", name: "PUBG Mobile", image: "/public/PUBG.svg" },
  { id: "ef", short: "eF", name: "eFootball", image: "/public/eFootball.svg" },
];

export default function FeaturedGames() {
  return (
    <section className="border-b border-agl-border py-section-sm">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-agl-white">
              EXPLORE TOURNAMENTS
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase text-agl-white md:text-section">
              Featured Games
            </h2>
          </div>
          <Link
            to="/tournaments"
            className="text-sm font-semibold text-agl-lime hover:text-agl-lime-light"
          >
            All tournaments →
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((g, i) => (
            <Reveal key={g.id} delay={i * 0.08}>
              <Link
                to={`/tournaments?game=${g.id}`}
                className="group block h-full overflow-hidden rounded-agl-lg border border-white/15 bg-white/[0.04] transition hover:-translate-y-1 hover:border-agl-red hover:shadow-agl-glow"
              >
                {/* Picture */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={g.image}
                    alt={g.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded bg-agl-black/70 px-2 py-1 text-[10px] font-bold tracking-wide text-agl-white backdrop-blur">
                    {g.short}
                  </span>
                </div>

                {/* Text */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-agl-white">{g.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-agl-red">
                    View tournaments →
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
