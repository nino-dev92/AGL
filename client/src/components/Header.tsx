import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { IoMdMenu } from "react-icons/io";
import { FaPowerOff } from "react-icons/fa";
import { toast } from "sonner";
import useAuth from "../hooks/useAuth";
import apiAxios from "../api/apiAxios";

export default function Header() {
  const { auth, setAuth } = useAuth();
  const [show, setShow] = useState<boolean>(false);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await apiAxios.post("/auth/logout");
    } catch (error) {
      console.error("Failed to invalidate server session during logout", error);
      toast.error(
        "Could not contact the server. You have been logged out here.",
      );
    } finally {
      setAuth(null);
      navigate("/");
      setShow(false);
    }
  };

  return (
    <header className="text-agl-primary border-b border-agl-border w-full sticky top-0 z-10 bg-agl-black">
      <div className="flex justify-between px-6 py-3 xl:px-main-x-lg">
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
              className="text-agl-gray text-[14px] font-bold hover:text-agl-primary aria-[current=page]:text-agl-primary transition-all duration-200"
            >
              Home
            </NavLink>
            <NavLink
              to="/tournaments"
              className="text-agl-gray text-[14px] font-bold hover:text-agl-primary aria-[current=page]:text-agl-primary transition-all duration-200"
            >
              Tournaments
            </NavLink>
            <NavLink
              to="/players"
              className="text-agl-gray text-[14px] font-bold hover:text-agl-primary aria-[current=page]:text-agl-primary transition-all duration-200"
            >
              Players
            </NavLink>
            <NavLink
              to="/profile"
              className="text-agl-gray text-[14px] font-bold hover:text-agl-primary aria-[current=page]:text-agl-primary transition-all duration-200"
            >
              Profile
            </NavLink>
          </nav>

          {/** Action buttons */}
          <div className="flex gap-3 ml-5">
            <button className="text-[14px] border border-agl-red py-1.75 px-3.5 bg-agl-red hover:bg-red-400 rounded cursor-pointer font-bold transition-all duration-200">
              Watch Now
            </button>

            <button
              className="border flex items-center gap-2 border-agl-primary text-[14px] py-1.75 px-3.5 rounded cursor-pointer font-bold hover:bg-agl-primary hover:text-agl-black transition-all duration-200"
              onClick={() => {
                if (!auth?.username) navigate("/signup");
                if (auth?.username) logout();
              }}
            >
              {auth && <FaPowerOff />}
              {auth ? "Logout" : "Sign Up"}
            </button>
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
                className="text-agl-gray text-[14px] font-bold hover:text-agl-primary transition-all duration-200"
              >
                Home
              </Link>
              <Link
                to="/tournaments"
                className="text-agl-gray text-[14px] font-bold hover:text-agl-primary transition-all duration-200"
              >
                Tournaments
              </Link>
              <Link
                to="/players"
                className="text-agl-gray text-[14px] font-bold hover:text-agl-primary transition-all duration-200"
              >
                Players
              </Link>
              <Link
                to="/profile"
                className="text-agl-gray text-[14px] font-bold hover:text-agl-primary transition-all duration-200"
              >
                Profile
              </Link>
            </nav>

            {/** Action buttons */}
            <div className="flex flex-col grow gap-3">
              <button className="text-[14px] w-full border border-agl-red py-1.75 px-3.5 bg-agl-red hover:bg-red-400 rounded cursor-pointer font-bold transition-all duration-200">
                Watch Now
              </button>

              <button
                className="border flex justify-center items-center gap-2 border-agl-primary text-[14px] py-1.75 px-3.5 rounded cursor-pointer font-bold hover:bg-agl-primary hover:text-agl-black transition-all duration-200"
                onClick={() => {
                  if (!auth) navigate("/signup");
                  if (auth) logout();
                }}
              >
                {auth && <FaPowerOff />}
                {auth ? "Logout" : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
