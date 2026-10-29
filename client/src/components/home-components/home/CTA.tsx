import { Link } from "react-router-dom";
import Reveal from "./Reveal";

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-section-sm">
      <div className="pointer-events-none absolute inset-0 " />
      <Reveal className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
        <h2 className="font-display text-3xl uppercase text-agl-white md:text-section">
          Your next match <span className="text-agl-red">startshere.</span>
        </h2>
        <p className="mt-4 text-agl-gray">
          Join thousands of players competing, watching and building
          communities around the games they love.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/signup"
            className="w-56 rounded-agl-sm bg-agl-red py-3 text-center text-sm font-bold text-agl-white shadow-agl-glow transition hover:bg-agl-lime-red"
          >
            Create Your Free Account
          </Link>
          <Link
            to="/tournaments"
            className="w-56 rounded-agl-sm border border-agl-border-white py-3 text-center text-sm font-semibold text-agl-white transition hover:border-agl-red hover:text-agl-red"
          >
            Browse Tournaments
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
