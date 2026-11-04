import InfoCard from "./InfoCard";
import type { Team } from "../../../types/types";
import { ImConnection } from "react-icons/im";
import { TbActivityHeartbeat } from "react-icons/tb";
import { FaArrowTrendUp } from "react-icons/fa6";
import { LuCrown } from "react-icons/lu";

type Props = {
  teams: Team[];
};

export default function InfoDiv({ teams }: Props) {
  const players = teams.flatMap((team) => team.members);
  const total = new Set(
    players
      .map((player) => player._id)
      .filter((id): id is string => Boolean(id)),
  ).size;

  let totalKD = 0;
  const individualKD: { username: string; KD: number }[] = [];

  players.forEach((player) => {
    const kills = player.totalKills ?? 0;
    const deaths = player.totalDeaths ?? 0;
    const playerKD = deaths === 0 ? kills : kills / deaths;

    totalKD += playerKD;

    individualKD.push({
      username: player.userName,
      KD: playerKD,
    });
  });

  const averageKD = total > 0 ? totalKD / total : 0;

  const topPerformer = individualKD.reduce((maxPlayer, currentPlayer) => {
    return currentPlayer.KD > (maxPlayer?.KD ?? 0) ? currentPlayer : maxPlayer;
  }, individualKD[0] || null);

  const info = [
    {
      id: "1",
      title: "PLAYERS ONLINE",
      value: total ?? 0,
      extraDetails: "0 away",
      color: "agl-success",
      icon: <ImConnection size={20} className="text-agl-success" />,
    },
    {
      id: "2",
      title: "TOTAL PLAYERS",
      value: total ?? 0,
      extraDetails: `${total ?? 0} registered`,
      icon: <TbActivityHeartbeat size={20} className="text-agl-white" />,
      color: "agl-white",
    },
    {
      id: "3",
      title: "AVERAGE KD",
      value: averageKD.toFixed(2),
      extraDetails: "all players",
      icon: <FaArrowTrendUp size={20} className="text-agl-yellow" />,
      color: "agl-yellow",
    },
    {
      id: "4",
      title: "TOP PERFORMER",
      value: topPerformer?.username.toUpperCase() ?? "—",
      extraDetails: `${topPerformer?.KD.toFixed(2) ?? "0.00"} KD`,
      icon: <LuCrown size={20} className="text-agl-red" />,
      color: "agl-red",
    },
  ];

  return (
    <div className="grid grid-cols-2 auto-rows-fr gap-4 mt-4 lg:grid-cols-4">
      {info.map((info) => {
        return (
          <div key={info.id} className="h-full">
            <InfoCard info={info} />
          </div>
        );
      })}
    </div>
  );
}
