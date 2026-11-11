import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="text-agl-primary flex flex-col px-10 pt-16 lg:px-main-x-lg border-t border-agl-border-light">
      <section className="grid grid-cols-2 gap-8 lg:flex lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 cursor-pointer">
            <p className="text-agl-red text-[22px] font-orbitron font-bold">
              AGL
            </p>
            <div className="flex flex-col">
              <b className="text-[16px] font-bold leading-4">AGL</b>
              <small className="text-agl-yellow text-[9px] font-bold tracking-widest">
                AFRICAN GLOBAL LEAGUE
              </small>
            </div>
          </div>
          <div>
            <p className="text-[14px] max-w-[35ch]">
              The all-in-one platform for competitive gaming. Compete. Watch.
              Stake. Win.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-[12px] font-bold">PLATFORM</h4>
          <div className="flex flex-col gap-2 text-agl-gray-dark">
            <Link
              to="/"
              className="hover:text-primary text-[14px] transition-all duration-200"
            >
              Home
            </Link>
            <Link
              to="/tournaments"
              className="hover:text-primary text-[14px] transition-all duration-200"
            >
              Tournaments
            </Link>
            <Link
              to="/players"
              className="hover:text-primary text-[14px] transition-all duration-200"
            >
              Players
            </Link>
            <Link
              to="/"
              className="hover:text-primary text-[14px] transition-all duration-200"
            >
              Watch
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[12px] font-bold">GAMES</h4>
          <div className="flex flex-col gap-2 text-agl-gray-dark">
            <Link
              to=""
              className="hover:text-primary text-[14px] transition-all duration-200"
            >
              Call of Duty: Mobile
            </Link>
            <Link
              to=""
              className="hover:text-primary text-[14px] transition-all duration-200"
            >
              Free Fire
            </Link>
            <Link
              to="/"
              className="hover:text-primary text-[14px] transition-all duration-200"
            >
              PUBG Mobile
            </Link>
            <Link
              to="/"
              className="hover:text-primary text-[14px] transition-all duration-200"
            >
              eFootball
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[12px] font-bold">PLAYERS</h4>
          <div className="flex flex-col gap-2 text-agl-gray-dark">
            <Link
              to="/"
              className="hover:text-primary text-[14px] transition-all duration-200"
            >
              Create Account
            </Link>
            <Link
              to=""
              className="hover:text-primary text-[14px] transition-all duration-200"
            >
              My Profile
            </Link>
            <Link
              to="/"
              className="hover:text-primary text-[14px] transition-all duration-200"
            >
              How It Works
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-[12px] font-bold">LEGAL</h4>
          <div className="flex flex-col gap-2 text-agl-gray-dark">
            <Link
              to=""
              className="hover:text-primary text-[14px] transition-all duration-200"
            >
              Terms
            </Link>
            <Link
              to=""
              className="hover:text-primary text-[14px] transition-all duration-200"
            >
              Privacy
            </Link>
          </div>
        </div>
      </section>
      <section className="border-t border-agl-border-light mt-14 p-8 text-[13px]">
        <p>
          &copy; {`${new Date().getFullYear()}`} African Global League. All
          rights reserved.
        </p>
      </section>
    </footer>
  );
}
