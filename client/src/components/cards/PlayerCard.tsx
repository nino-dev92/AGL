import type { User } from "../../types/types";
import { useNavigate } from "react-router-dom";

type Props = {
  player: User;
};

export default function PlayerCard({ player }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className="flex min-h-15 min-w-0 w-full items-center gap-2 rounded-xl border border-agl-border-light px-4 py-2 text-agl-primary transition-all duration-400 hover:scale-102 hover:shadow-sm hover:shadow-agl-gray cursor-pointer"
      onClick={() => navigate(`/player/${player.userName}`)}
    >
      {/**Player Image */}
      <div className="flex w-12 shrink-0 aspect-square justify-center rounded-[50%] border border-agl-red bg-agl-red text-center font-bold text-agl-primary">
        <p className="m-auto">{player.userName.charAt(0).toUpperCase()}</p>
      </div>

      {/**Player Details */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-sans font-bold">
          {player.userName.toUpperCase()}
        </p>
        <p className="truncate text-[12px] text-agl-gray font-sans">
          {player.game?.name ?? "Game not set"} -{" "}
          {player.region ?? "Region not set"}
        </p>
      </div>
    </div>
  );
}
