import type { Match } from "../../../types/types";
import { IoMdTime } from "react-icons/io";

type Props = {
  match: Match;
};

export default function UpComingMatchesCard({ match }: Props) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row justify-between p-2 sm:p-4 bg-agl-gray-dark/20 rounded-xl">
      <div className="flex items-center gap-2">
        <TeamCard team={match.teamA} />
        <p className="text-[12px] text-agl-gray">vs</p>
        <TeamCard team={match.teamB} />
      </div>
      <div className="flex items-center gap-1 text-agl-gray text-[12px]">
        <IoMdTime />
        {new Date(match.scheduledDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}

const TeamCard = ({
  team,
}: {
  team: { name: string; logo?: { url: string } };
}) => {
  return (
    <div className="flex gap-2 items-center">
      {team.logo?.url ? (
        <div
          className="bg-cover bg-center h-8 aspect-square"
          style={{ backgroundImage: `url("${team.logo.url}")` }}
        />
      ) : (
        <div className="h-8 aspect-square rounded-full bg-agl-gray/20 flex items-center justify-center text-xs font-semibold text-agl-gray">
          {team.name.charAt(0).toUpperCase()}
        </div>
      )}

      <p className="font-semibold text-[12px] sm:text-[14px]">{team.name}</p>
    </div>
  );
};
