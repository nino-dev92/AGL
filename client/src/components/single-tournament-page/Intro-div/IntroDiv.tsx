import type { Tournament } from "../../../types/types";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";

type Props = {
  tournament: Tournament;
};

export default function IntroDiv({ tournament }: Props) {
  const navigate = useNavigate();
  const statusColor =
    tournament.status === "ongoing"
      ? "border-agl-success bg-agl-success/20 text-agl-success"
      : tournament.status === "upcoming"
        ? "border-agl-yellow bg-agl-yellow/20 text-agl-yellow"
        : tournament.status === "registration-open"
          ? "border-agl-success bg-agl-accent/20 text-agl-success"
          : "border-agl-red bg-agl-red/20 text-agl-red";

  return (
    <section
      className="relative h-80 bg-agl-black/80 bg-blend-overlay flex w-full items-end overflow-hidden rounded-2xl bg-cover bg-center text-agl-white"
      style={
        tournament.banner?.url
          ? { backgroundImage: `url("${tournament.banner.url}")` }
          : { backgroundImage: `url("/logo.png")` }
      }
    >
      <div className="flex flex-col gap-2 w-full px-8 py-1">
        <button
          type="button"
          className="group flex items-center gap-2 text-[14px] text-agl-gray hover:text-agl-yellow cursor-pointer transition-all duration-200 ease"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-all duration-200" />{" "}
          All Tournaments
        </button>
        <div className="flex gap-2 items-center text-[11px]">
          <p
            className={`w-fit rounded-xl border px-1 text-[10px] font-bold ${statusColor}`}
          >
            {tournament.status.toUpperCase()}
          </p>
          <p className="text-[13px] text-agl-yellow">{tournament.game.name}</p>
        </div>
        <h1 className="font-inter font-extrabold text-3xl sm:text-6xl">
          {tournament.name.toUpperCase()}
        </h1>
      </div>
    </section>
  );
}
