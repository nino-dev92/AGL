import { FaTrophy } from "react-icons/fa6";
import type { TournamentStanding } from "../../types/types";

type Props = {
  standing: TournamentStanding | null;
};

export default function CurrentLeaderCard({ standing }: Props) {
  return (
    <section className="mt-2">
      <div className="flex items-center justify-between p-4 sm:p-6 border border-agl-yellow/70 bg-linear-to-r from-agl-yellow/13 via-agl-yellow/10 to-black rounded-xl">
        <div className="flex items-center gap-4">
          {" "}
          {/**Image*/}
          {standing?.team.logo?.url ? (
            <div
              style={{ backgroundImage: `url("${standing.team.logo.url}")` }}
              className="w-20 h-20 rounded-xl bg-center bg-contain bg-no-repeat"
              role="img"
              aria-label={`${standing.team.name} logo`}
            />
          ) : (
            <div
              className="flex w-20 h-20 items-center justify-center rounded-xl bg-agl-gray/20 text-2xl font-bold text-agl-gray"
              aria-hidden="true"
            >
              {standing?.team.name.charAt(0).toUpperCase() ?? "—"}
            </div>
          )}
          {/**Details */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center text-[11px] sm:text-[12px] gap-2 text-agl-yellow font-bold">
              <FaTrophy /> <p>CURRENT LEADER</p>
            </div>
            <h3 className="font-bold text-md sm:text-xl">
              {standing?.team.name ?? "—"}
            </h3>
            <p className="text-agl-gray text-[12px] sm:text-[16px] ">
              {standing
                ? `${standing.mw}W . ${standing.ml}L . ${standing.points} pts`
                : "—"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-agl-yellow font-bold text-xl sm:text-3xl">
            {standing ? "#1" : "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
