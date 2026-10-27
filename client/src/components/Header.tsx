import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/tournaments", label: "Tournaments" },
  { to: "/players", label: "Players" },
  { to: "/staking", label: "Staking (soon)" },
  { to: "/account", label: "Profile" },
];

export function Logo() {
  return (
     <Link to="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <p className="text-agl-red text-[22px] font-orbitron font-bold">
              AGL
            </p>
            <div className="flex flex-col">
              <b className="text-[16px] font-bold leading-4 text-white">AGL</b>
              <small className="text-agl-yellow text-[9px] font-bold">
                AFRICAN GLOBAL LEAGUE
              </small>
            </div>
          </div>
        </Link>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-agl-border bg-agl-black/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-6">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-agl-lime ${
                  isActive ? "text-agl-lime" : "text-agl-gray-light"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/#watch"
            className="rounded-agl-sm border border-agl-border-light px-4 py-2 text-sm font-semibold text-agl-white transition-colors hover:border-agl-lime hover:text-agl-lime"
          >
            Watch Now
          </a>
          <Link
            to="/signup"
            className="rounded-agl-sm bg-agl-lime px-4 py-2 text-sm font-bold text-agl-black transition-colors hover:bg-agl-lime-light"
          >
            Sign Up
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="grid h-10 w-10 place-items-center rounded-agl-sm border border-agl-border-light text-agl-white lg:hidden"
        >
          <span className="text-lg leading-none">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-agl-border bg-agl-black px-4 pb-4 lg:hidden">
          <nav className="flex flex-col">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className="border-b border-agl-border py-3 text-sm text-agl-gray-light"
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex gap-3">
            <a
              href="/#watch"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-agl-sm border border-agl-border-light py-2 text-center text-sm font-semibold text-agl-white"
            >
              Watch Now
            </a>
            <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-agl-sm bg-agl-lime py-2 text-center text-sm font-bold text-agl-black"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
