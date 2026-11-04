import type { Team, TeamMember } from "../../../types/types";
import PlayerCard from "./PlayerCard";

type Props = {
  teams: Team[];
};

export default function LoggedIn({ teams }: Props) {
  const playersById = new Map<string, TeamMember>();

  teams.forEach((team) => {
    team.members.forEach((member) => {
      const key = member._id ?? member.userName.toLowerCase();
      if (!playersById.has(key)) playersById.set(key, member);
    });
  });
  const players = Array.from(playersById.values());

  return (
    <div className="p-4 border border-agl-border-light bg-agl-background-light rounded-2xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center text-agl-white font-bebas-neue text-[20px]">
          PLAYERS
        </h2>
        <p className="flex h-6 items-center rounded-full border border-agl-border-light px-3 text-[12px] font-bold text-agl-gray-light">
          {players.length} {players.length === 1 ? "player" : "players"}
        </p>
      </div>

      {players.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-agl-border-light px-4 py-8 text-center text-sm text-agl-gray">
          No players in the roster yet.
        </p>
      ) : (
        <ul
          aria-label="Player roster"
          className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
        >
          {players.map((player) => (
            <li key={player._id ?? player.userName.toLowerCase()}>
              <PlayerCard player={player} variant="roster" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
