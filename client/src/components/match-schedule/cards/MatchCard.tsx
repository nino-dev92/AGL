import type { Match } from "../../../types/types";
import { IoMdTime } from "react-icons/io";
import { CiCalendarDate } from "react-icons/ci";
import { BsCameraVideo } from "react-icons/bs";

type Props = {
  matches: Match[];
};

type TeamCardProps = {
  team: { logo?: { url: string }; name: string; _id: string };
};

const TeamCard = ({ team }: TeamCardProps) => {
  return (
    <div className="flex items-center gap-2">
      {team.logo?.url ? (
        <div
          className="h-12 w-12 shrink-0 rounded bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${team.logo.url}")` }}
          role="img"
          aria-label={`${team.name} logo`}
        />
      ) : (
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-agl-gray/20 font-bold text-agl-gray"
          aria-hidden="true"
        >
          {team.name.charAt(0).toUpperCase()}
        </div>
      )}
      <p className="font-bold">{team.name}</p>
    </div>
  );
};

export default function MatchCard({ matches }: Props) {
  if (matches.length < 1)
    return (
      <h1 className="text-agl-white m-15 sm:m-30 text-center">
        No match available
      </h1>
    );

  return (
    <div className="flex flex-col gap-4">
      {matches.map((match) => (
        <div
          key={match._id}
          className="rounded-xl border border-agl-border-light bg-agl-background-darker-gray p-4 text-agl-white transition-shadow duration-300 hover:shadow-[0_0_24px_rgba(235,41,41,0.35)]"
        >
          {/**Top buttons */}
          <div className="flex justify-between">
            <div className="flex gap-2 text-agl-gray text-[12px]">
              <button
                type="button"
                className="font-bold border px-2 border-agl-gray bg-agl-gray/20  rounded-full"
              >
                FINAL
              </button>
              <button
                type="button"
                className="font-bold border-agl-gray bg-agl-gray/20 px-2 rounded"
              >
                R1
              </button>
              <button
                type="button"
                className="px-2 text-agl-yellow bg-agl-yellow/30 font-bold rounded"
              >
                Bo3
              </button>
            </div>

            <div>
              <button
                type="button"
                className="flex items-center font-bold p-1 gap-1 text-agl-red bg-agl-red/20 hover:bg-agl-red/40 text-[10px] rounded transition-colors duration-200"
              >
                {match.status !== "completed" && <BsCameraVideo /> + " Watch"}
                {match.status === "completed" && "completed"}
              </button>
            </div>
          </div>

          {/**Team match */}
          <div className="flex justify-between mt-5 pb-1 border-b border-agl-border-light ">
            {/**Team A */}
            <TeamCard team={match.teamA} />

            {/**Score and time*/}
            <div className="flex flex-col place-items-center">
              <div className="flex gap-2 font-bold text-3xl">
                <p className="">{match.teamAScore ?? 0}</p>
                <p className="">:</p>
                <p className="">{match.teamBScore ?? 0}</p>
              </div>

              <div className="flex text-agl-gray items-center gap-1 text-[11px]">
                <IoMdTime />
                {match.scheduledTime ??
                  new Date(match.scheduledDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </div>
            </div>
            {/**Team B*/}
            <TeamCard team={match.teamB} />
          </div>

          {/**Date */}
          <div className="mt-2 flex items-center gap-2 text-[13px] text-agl-gray">
            <CiCalendarDate />
            <p>Nov 15</p>
          </div>
        </div>
      ))}
    </div>
  );
}
