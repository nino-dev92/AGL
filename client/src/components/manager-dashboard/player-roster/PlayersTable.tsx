import type { TeamMember } from "../../../types/types";

type Props = {
  team: TeamMember[];
};

export default function PlayersTable({ team }: Props) {
  const seenIds = new Set<TeamMember["_id"]>();
  const players = team.filter((member) => {
    if (seenIds.has(member._id)) return false;
    seenIds.add(member._id);
    return true;
  });

  return (
    <div className="text-agl-white border-b border-b-agl-background-light rounded-2xl overflow-hidden">
      <div className="max-w-full overflow-x-auto" tabIndex={0}>
        <table className="w-full min-w-160">
          <thead className="text-agl-gray text-[13px]">
            <tr>
              <th className="py-2.5 px-4 text-left">PLAYER</th>
              <th className="py-2.5">STATUS</th>
              <th className="py-2.5">KD</th>
              <th className="py-2.5">KILLS</th>
              <th className="py-2.5">WINS</th>
              <th className="py-2.5">MATCHES</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
              return (
                <tr
                  key={`${player._id}-${index}`}
                  className={`text-center border-t border-agl-border-light hover:bg-agl-border/50 transition-colors duration-200 ease ${
                    index === players.length - 1
                      ? "[&>td:first-child]:rounded-bl-2xl [&>td:last-child]:rounded-br-2xl"
                      : ""
                  }`}
                >
                  <td className="py-3 px-4 text-left">
                    <div className="flex items-center gap-2">
                      <div className="h-9 flex justify-center items-center aspect-square bg-agl-red rounded-full">
                        {player.userName.charAt(0).toUpperCase()}
                      </div>
                      {player.userName.toUpperCase()}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="bg-agl-success h-2 aspect-square rounded-full"></div>
                      online
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    {player.totalDeaths! > 1
                      ? (player.totalKills! / player.totalDeaths!).toFixed(2)
                      : player.totalKills}
                  </td>
                  <td className="py-3 px-2">{player.totalKills}</td>
                  <td className="py-3 px-2">{player.totalDeaths}</td>
                  <td className="py-3 px-2">{player.totalGames}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
