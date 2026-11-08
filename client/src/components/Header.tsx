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

  const navDetail = {
    text:
      auth?.role === "admin" ||
      auth?.role === "manager" ||
      auth?.role === "organizer"
        ? "Dashboard"
        : "Home",
    link:
      auth?.role === "admin"
        ? "/admin/dashboard"
        : auth?.role === "manager"
          ? "/manager/dashboard"
          : auth?.role === "organizer"
            ? "/organizer/dashboard"
            : "/",
  };

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
    <header className="sticky top-0 z-20 w-full border-b border-agl-border bg-agl-black text-agl-primary">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 xl:px-main-x-lg">
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

        {/** Desktop Nav */}
        <div className="hidden lg:flex gap-3 items-center">
          <nav className="flex gap-6">
            <NavLink
              to={navDetail.link}
              className="text-agl-gray text-[14px] font-bold hover:text-agl-primary aria-[current=page]:text-agl-primary transition-all duration-200"
            >
              {navDetail.text}
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
              to="/watch-now"
              className="text-agl-gray text-[14px] font-bold hover:text-agl-primary aria-[current=page]:text-agl-primary transition-all duration-200"
            >
              Watch Now
            </NavLink>
          </nav>

          {/** Action buttons */}
          <div className="flex gap-3 ml-5">
            <button
              type="button"
              className={`${auth?.role === "manager" || auth?.role === "admin" || auth?.role === "organizer" ? "hidden" : ""} text-[14px] border border-agl-red py-1.75 px-3.5 bg-agl-red hover:bg-red-400 rounded cursor-pointer font-bold transition-all duration-200`}
              onClick={() => navigate("/profile")}
            >
              Profile
            </button>

            <button
              type="button"
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

        {/**Hamburger Icon */}
        <button
          type="button"
          className="flex shrink-0 items-center justify-center text-white lg:hidden cursor-pointer"
          aria-label={show ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={show}
          onClick={() => setShow((visible) => !visible)}
        >
          <IoMdMenu size={30} aria-hidden="true" />
        </button>
      </div>

      {/**Mobile Nav */}
      {show && (
        <div className="absolute left-0 top-full flex w-full border-b border-agl-border-light bg-agl-black px-4 py-3 text-white shadow-lg sm:px-6 lg:hidden">
          <div className="flex flex-col gap-3 w-full">
            <nav className="flex flex-col justify-start gap-6">
              <NavLink
                to={navDetail.link}
                className="text-agl-gray text-[14px] font-bold hover:text-agl-primary aria-[current=page]:text-agl-primary transition-all duration-200"
              >
                {navDetail.text}
              </NavLink>
              <NavLink
                to="/tournaments"
                onClick={() => setShow(false)}
                className="text-agl-gray text-[14px] font-bold hover:text-agl-primary aria-[current=page]:text-agl-primary transition-all duration-200"
              >
                Tournaments
              </NavLink>
              <NavLink
                to="/players"
                onClick={() => setShow(false)}
                className="text-agl-gray text-[14px] font-bold hover:text-agl-primary aria-[current=page]:text-agl-primary transition-all duration-200"
              >
                Players
              </NavLink>
              <NavLink
                to="/watch-now"
                onClick={() => setShow(false)}
                className="text-agl-gray text-[14px] font-bold hover:text-agl-primary aria-[current=page]:text-agl-primary transition-all duration-200"
              >
                Watch Now
              </NavLink>
            </nav>

            {/** Action buttons */}
            <div className="flex flex-col grow gap-3 mt-2">
              <button
                type="button"
                className={`${auth?.role === "manager" || auth?.role === "admin" || auth?.role === "organizer" ? "hidden" : ""} text-[14px] border border-agl-red py-1.75 px-3.5 bg-agl-red hover:bg-red-400 rounded cursor-pointer font-bold transition-all duration-200`}
                onClick={() => navigate("/profile")}
              >
                Profile
              </button>

              <button
                type="button"
                className="border flex justify-center items-center gap-2 border-agl-primary text-[14px] py-1.75 px-3.5 rounded cursor-pointer font-bold hover:bg-agl-primary hover:text-agl-black transition-all duration-200"
                onClick={() => {
                  if (!auth) {
                    setShow(false);
                    navigate("/signup");
                  }
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
