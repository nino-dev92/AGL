import { useNavigate } from "react-router-dom";
import { IoIosStats } from "react-icons/io";
import { FaArrowRight } from "react-icons/fa6";
import StandingsTable from "./StandingsTable";
import type { TournamentStanding } from "../../../types/types";

type Props = {
  standings: TournamentStanding[];
  tournamentId?: string;
};

export default function Standings({ standings, tournamentId }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex w-full min-w-0 flex-col gap-1 overflow-hidden rounded-xl border border-agl-border-light bg-agl-background-darker-gray text-white">
      {/**Top section */}
      <div className="flex items-center justify-between gap-1 sm:gap-3 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <IoIosStats size={22} />
          <h3 className="font-bold text-sm sm:text-lg">Tournament Standings</h3>
        </div>
        <div className="flex flex-col sm:flex-row shrink-0 cursor-pointer items-center gap-1 text-[12px] text-agl-yellow hover:text-agl-yellow/80">
          <p onClick={() => navigate(`/tournament-standings/${tournamentId}`)}>
            View all
          </p>
          <FaArrowRight />
        </div>
      </div>

      {/**Standings Table */}
      <div className="w-full min-w-0 overflow-x-auto border-t border-agl-border-light">
        <StandingsTable standings={standings} />
      </div>
    </div>
  );
}
