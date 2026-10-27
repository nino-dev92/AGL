import { Link } from "react-router-dom";
import Reveal from "./Reveal";

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-section-sm">
      <div className="pointer-events-none absolute inset-0 bg-agl-radial" />
      <Reveal className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
        <h2 className="font-display text-3xl uppercase text-agl-white md:text-section">
          Your next match starts <span className="text-agl-lime">here.</span>
        </h2>
        <p className="mt-4 text-agl-gray">
          Join thousands of players competing, watching and building
          communities around the games they love.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/signup"
            className="rounded-agl-sm bg-agl-lime px-6 py-3 text-sm font-bold text-agl-black shadow-agl-glow transition hover:bg-agl-lime-light"
          >
            Create Your Free Account
          </Link>
          <Link
            to="/tournaments"
            className="rounded-agl-sm border border-agl-border-light px-6 py-3 text-sm font-semibold text-agl-white transition hover:border-agl-lime hover:text-agl-lime"
          >
            Browse Tournaments
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
