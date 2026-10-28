import { Link } from "react-router-dom";

type FooterLink = { label: string; to?: string; href?: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "PLATFORM",
    links: [
      { label: "Home", to: "/" },
      { label: "Tournaments", to: "/tournaments" },
      { label: "Players", to: "/players" },
      { label: "Staking", to: "/staking" },
      { label: "Watch", href: "/#watch" },
    ],
  },
  {
    title: "GAMES",
    links: [
      { label: "Call of Duty: Mobile", to: "/tournaments?game=codm" },
      { label: "Free Fire", to: "/tournaments?game=ff" },
      { label: "PUBG Mobile", to: "/tournaments?game=pubgm" },
      { label: "eFootball", to: "/tournaments?game=ef" },
    ],
  },
  {
    title: "PLAYERS",
    links: [
      { label: "Create Account", to: "/signup" },
      { label: "My Profile", to: "/profile" },
      { label: "How It Works", href: "/#how" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { label: "Terms", to: "/terms" },
      { label: "Privacy", to: "/privacy" },
      { label: "Staking Rules", to: "/staking#rules" },
    ],
  },
];

const linkClass =
  "text-[14px] text-agl-gray-dark transition-all duration-200 hover:text-agl-white";

export default function Footer() {
  return (
    <footer className="border-t border-agl-border-light bg-agl-black text-agl-primary">
      <div className="mx-auto max-w-[1280px] px-4 pt-14 md:px-6 md:pt-16">
        <section className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-orbitron text-[22px] font-bold text-agl-red">
                AGL
              </span>
              <span className="flex flex-col">
                <b className="text-[16px] font-bold leading-4 text-agl-white">
                  AGL
                </b>
                <small className="text-[9px] font-bold tracking-widest text-agl-yellow">
                  AFRICAN GLOBAL LEAGUE
                </small>
              </span>
            </Link>
            <p className="max-w-[35ch] text-[14px] text-agl-gray">
              The all-in-one platform for competitive gaming. Compete. Watch.
              Stake. Win.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h4 className="text-[12px] font-bold tracking-widest text-agl-white">
                {col.title}
              </h4>
              <div className="flex flex-col gap-2.5">
                {col.links.map((l) =>
                  l.href ? (
                    <a key={l.label} href={l.href} className={linkClass}>
                      {l.label}
                    </a>
                  ) : (
                    <Link key={l.label} to={l.to!} className={linkClass}>
                      {l.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Bottom bar */}
        <section className="mt-12 flex flex-col gap-3 border-t border-agl-border-light py-8 text-[12px] text-agl-gray-dark md:flex-row md:items-center md:justify-between md:gap-8">
          <p>
            &copy; {new Date().getFullYear()} African Global League. All
            rights reserved.
          </p>
          <p className="md:max-w-xl md:text-right">
            Staking/support features are subject to platform rules and
            applicable regulations. No guaranteed returns.
          </p>
        </section>
      </div>
    </footer>
  );
}