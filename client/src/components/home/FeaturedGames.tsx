import { Link } from "react-router-dom";
import Reveal from "./Reveal";

const games = [
  { id: "codm", short: "CODM", name: "Call of Duty: Mobile" },
  { id: "ff", short: "FF", name: "Free Fire" },
  { id: "pubgm", short: "PUBG M", name: "PUBG Mobile" },
  { id: "ef", short: "eF", name: "eFootball" },
];

export default function FeaturedGames() {
  return (
    <section className="border-b border-agl-border py-section-sm">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-agl-lime">
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
                className="group block h-full rounded-agl-lg border border-agl-border bg-agl-card p-6 transition hover:-translate-y-1 hover:border-agl-lime hover:shadow-agl-glow"
              >
                <div className="grid h-16 w-16 place-items-center rounded-agl bg-agl-surface-light font-display text-sm text-agl-lime">
                  {g.short}
                </div>
                <h3 className="mt-6 text-lg font-bold text-agl-white">
                  {g.name}
                </h3>
                <p className="mt-2 text-sm text-agl-gray transition-colors group-hover:text-agl-lime">
                  View tournaments →
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
