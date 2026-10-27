import { Link } from "react-router-dom";
import { Logo } from "./Header";

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
      { label: "My Profile", to: "/account" },
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
  "text-sm text-agl-gray transition-colors hover:text-agl-lime";

export default function Footer() {
  return (
    <footer className="border-t border-agl-border bg-agl-black-soft">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 md:px-6 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-agl-gray">
            The all-in-one platform for competitive gaming. Compete. Watch.
            Stake. Win.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-xs font-bold tracking-[0.2em] text-agl-white">
              {col.title}
            </h4>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.href ? (
                    <a href={l.href} className={linkClass}>
                      {l.label}
                    </a>
                  ) : (
                    <Link to={l.to!} className={linkClass}>
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-agl-border">
        <div className="mx-auto max-w-[1280px] space-y-1 px-4 py-6 text-xs text-agl-gray-dark md:px-6">
          <p>© 2026 African Global League. All rights reserved.</p>
          <p>
            Staking/support features are subject to platform rules and
            applicable regulations. No guaranteed returns.
          </p>
        </div>
      </div>
    </footer>
  );
}
