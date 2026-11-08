import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { IoIosStats } from "react-icons/io";
import type { Tournament } from "../../types/types";

type Props = {
  tournament: Tournament;
};

export default function IntroDiv({ tournament }: Props) {
  const navigate = useNavigate();

  return (
    <section className="flex mt-4">
      <div className="flex flex-col gap-2 w-full px-8 py-1">
        <button
          type="button"
          className="group flex items-center gap-2 text-[14px] text-agl-gray hover:text-agl-yellow cursor-pointer transition-all duration-200 ease"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-all duration-200" />{" "}
          Back to Tournament
        </button>
        <div className="flex gap-2 items-center text-[11px] mt-4">
          <div className="text-agl-yellow bg-agl-yellow/20 p-1 rounded-xl">
            <IoIosStats size={40} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-inter font-extrabold text-3xl sm:text-4xl">
              Full Standings
            </h1>
            <p className="text-[13px] text-agl-gray">
              {tournament.name} . {tournament.game.name}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
