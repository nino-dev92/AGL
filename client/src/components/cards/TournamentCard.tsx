import type { Tournament } from "../../types/types";
import { formatDate } from "../../utils/formateDate";
import { useNavigate } from "react-router-dom";

type Props = {
  tournament: Tournament;
};

export default function TournamentCard({ tournament }: Props) {
  const navigate = useNavigate();
  const slotsFilledPercent =
    tournament.maxTeams > 0
      ? Math.min(
          (tournament.registeredTeams.length / tournament.maxTeams) * 100,
          100,
        )
      : 0;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-agl-card border border-agl-border-light">
      {/**Card Image */}
      <section className="flex justify-between w-full relative aspect-video rounded-t-agl-card bg-[url('/COD.png')] bg-center">
        <button className="text-[11px] absolute top-3 left-3 font-extrabold bg-agl-black border border-agl-border-light p-1 rounded">
          {tournament.game.name.toUpperCase()}
        </button>
        <button className="text-[11px] absolute top-3 right-3 font-extrabold bg-red-500 px-2 py-1 rounded-2xl">
          {tournament.status.toUpperCase()}
        </button>
      </section>

      <section className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex-1">
          <p className="text-[12px] mb-3 text-agl-gray-dark font-inter font-extrabold leading-[1.4px]">
            {tournament.game.name}
          </p>
          <h3 className="line-clamp-2 min-h-14 font-extrabold font-inter text-[19px]">
            {tournament.description?.toUpperCase()}
          </h3>
          <p className="mb-3 min-h-12 text-[16px] font-inter font-bold text-agl-gray-dark">
            {formatDate(new Date(tournament.startDate))} -{" "}
            {formatDate(new Date(tournament.endDate))} . {tournament.region}
          </p>
        </div>

        {/**Entry and prize money */}
        <div className="flex w-full gap-3">
          <div className="w-1/2 min-w-0 rounded-lg border border-agl-border-light p-2">
            <p className="text-agl-gray-dark text-[10px] font-inter leading-1.5 font-extrabold">
              ENTRY
            </p>
            <p className="truncate text-[18px] font-extrabold">
              {tournament.currency}
              {tournament.entryFee.toLocaleString()}
            </p>
          </div>
          <div className="w-1/2 min-w-0 rounded-lg border border-agl-border-light p-2">
            <p className="text-agl-gray-dark text-[10px] font-inter leading-1.5 font-extrabold">
              PRIZE POOL
            </p>
            <p className="truncate text-[18px] font-extrabold text-agl-yellow">
              {tournament.currency}
              {tournament.prizePool.toLocaleString()}
            </p>
          </div>
        </div>

        {/**Slots filled */}
        <div className="mt-6">
          <p className="mb-2 text-[13px] text-agl-gray-dark ">
            {tournament.registeredTeams.length} / {tournament.maxTeams} slots
            filled
          </p>
          <div
            className="w-full h-1 bg-agl-border-light rounded overflow-hidden"
            role="progressbar"
            aria-label="Tournament slots filled"
            aria-valuemin={0}
            aria-valuemax={tournament.maxTeams}
            aria-valuenow={Math.min(
              tournament.registeredTeams.length,
              tournament.maxTeams,
            )}
          >
            <div
              className="h-full bg-agl-red rounded transition-[width] duration-300"
              style={{ width: `${slotsFilledPercent}%` }}
            />
          </div>
        </div>

        {/**Button */}
        <div className="w-full">
          <button
            className="mt-6 w-full cursor-pointer rounded-agl-button bg-red-500 p-2 font-medium transition-all duration-200 hover:bg-red-400"
            onClick={() => navigate(`/tournament/${tournament._id}`)}
          >
            View Tournament
          </button>
        </div>
      </section>
    </div>
  );
}
