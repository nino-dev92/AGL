import { useNavigate } from "react-router-dom";
import type { Tournament } from "../../types/types";
import { FaArrowLeft } from "react-icons/fa";

type Props = {
  tournament: Tournament;
};

export default function Intro({ tournament }: Props) {
  const navigate = useNavigate();

  return (
    <section className="flex flex-col">
      <div className="group flex text-agl-gray hover:text-agl-yellow transition-all duration-200">
        <p
          className="items-center gap-2 flex text-[14px] cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="group-hover:-translate-x-1 duration-200" />{" "}
          Back to {tournament.name.toUpperCase()}
        </p>
      </div>

      {/**Image and text*/}
      <div className="flex gap-2 mt-10">
        <img src="/logo.png" width={100} />

        <div>
          <h2 className="text-2xl sm:text-4xl font-extrabold">
            Match Schedule
          </h2>
          <p className=" gap-2 text-agl-gray text-[14px]">
            {tournament.name.toUpperCase()} .{" "}
            {tournament.game.name.toUpperCase()}
          </p>
        </div>
      </div>
    </section>
  );
}
