import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const points = [
  "Browse players across multiple game titles",
  "Track match history and performance metrics",
  "See tournament placements and achievements",
  "Connect with players and build your network",
];

export default function Players() {
  return (
    <section className="border-b border-agl-border py-section-sm">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 md:px-6 lg:grid-cols-2">
        <Reveal>
          <SectionHeading
            eyebrow="TOP COMPETITORS"
            title="Meet the players defining the scene."
          />
          <p className="mt-5 max-w-lg text-agl-gray">
            Discover rising talent and seasoned pros across multiple game
            titles. Track their match history, tournament placements, and
            performance stats in real-time.
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 text-sm text-agl-gray-light"
              >
                <span className="mt-0.5 text-agl-lime">✓</span>
                {p}
              </li>
            ))}
          </ul>
          <Link
            to="/players"
            className="mt-8 inline-block rounded-agl-sm bg-agl-lime px-6 py-3 text-sm font-bold text-agl-black transition hover:bg-agl-lime-light"
          >
            Explore Players
          </Link>
        </Reveal>

        {/* TODO: replace with real players from your API */}
        <Reveal delay={0.1}>
          <div className="rounded-agl-xl border border-dashed border-agl-border-light bg-agl-card p-10 text-center">
            <div className="text-4xl">👥</div>
            <h3 className="mt-4 text-lg font-bold text-agl-white">
              No players yet
            </h3>
            <p className="mt-2 text-sm text-agl-gray">
              Create your profile and join a tournament to appear here.
            </p>
            <Link
              to="/signup"
              className="mt-6 inline-block text-sm font-semibold text-agl-lime hover:text-agl-lime-light"
            >
              Create your account
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
