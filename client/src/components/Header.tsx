import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { IoMdMenu } from "react-icons/io";

export default function Header() {
  const [show, setShow] = useState<boolean>(false);

  return (
    <header className="text-agl-primary border-b border-agl-border w-full sticky top-0 z-10 bg-agl-black">
      <div className="flex justify-between py-3 px-6 xl:px-50">
        <Link to="/">
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
        </Link>

        {/** Desktop Header Links */}
        <div className="hidden lg:flex gap-3 items-center">
          <nav className="flex gap-6">
            {" "}
            <NavLink
              to="/"
              className="text-agl-gray text-[15px] font-bold hover:text-agl-white aria-[current=page]:text-agl-white transition-all duration-200"
            >
              Home
            </NavLink>
            <NavLink
              to="/tournaments"
              className="text-agl-gray text-[15px] font-bold hover:text-agl-white aria-[current=page]:text-agl-white transition-all duration-200"
            >
              Tournaments
            </NavLink>
            <NavLink
              to="/players"
              className="text-agl-gray text-[15px] font-bold hover:text-agl-white aria-[current=page]:text-agl-white transition-all duration-200"
            >
              Players
            </NavLink>
            <NavLink
              to="/profile"
              className="text-agl-gray text-[15px] font-bold hover:text-agl-white aria-[current=page]:text-agl-white transition-all duration-200"
            >
              Profile
            </NavLink>
          </nav>

          {/** Action buttons */}
          <div className="flex gap-3 ml-5">
            <Link to="">
              <button className="text-[15px] border border-agl-danger py-1.75 px-3.5 bg-agl-danger hover:bg-red-400 rounded cursor-pointer font-bold transition-all duration-200">
                Watch Now
              </button>
            </Link>
            <Link to="">
              <button className="border border-agl-primary text-[15px] py-1.75 px-3.5 rounded cursor-pointer font-bold hover:bg-agl-white hover:text-agl-black transition-all duration-200">
                Sign Up
              </button>
            </Link>
          </div>
        </div>

        {/**Hamburger Menu */}
        <div className="flex lg:hidden">
          <IoMdMenu
            size={30}
            className="text-white cursor-pointer"
            onClick={() => setShow(!show)}
          />
        </div>
      </div>

      {/**Mobile Nav */}
      {show && (
        <div
          className={`flex lg:hidden text-white fixed bg-agl-black z-10 w-full py-3 px-6 border-b border-agl-border-light`}
        >
          {" "}
          <div className="flex flex-col gap-3 w-full">
            <nav className="flex flex-col gap-6 justify-start">
              {" "}
              <Link
                to="/"
                className="text-agl-gray text-[15px] font-bold hover:text-agl-white transition-all duration-200"
              >
                Home
              </Link>
              <Link
                to="/tournaments"
                className="text-agl-gray text-[15px] font-bold hover:text-agl-white transition-all duration-200"
              >
                Tournaments
              </Link>
              <Link
                to="/players"
                className="text-agl-gray text-[15px] font-bold hover:text-agl-white transition-all duration-200"
              >
                Players
              </Link>
              <Link
                to="/profile"
                className="text-agl-gray text-[15px] font-bold hover:text-agl-white transition-all duration-200"
              >
                Profile
              </Link>
            </nav>

            {/** Action buttons */}
            <div className="flex flex-col grow gap-3">
              <Link to="">
                <button className="text-[15px] w-full border border-agl-danger py-1.75 px-3.5 bg-agl-danger hover:bg-red-400 rounded cursor-pointer font-bold transition-all duration-200">
                  Watch Now
                </button>
              </Link>
              <Link to="">
                <button className="border border-agl-primary w-full text-[15px] py-1.75 px-3.5 rounded cursor-pointer font-bold hover:bg-agl-white hover:text-agl-black transition-all duration-200">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
