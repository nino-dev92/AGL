import type { TournamentStanding } from "../../../types/types";

type Props = {
  standings: TournamentStanding[];
};

const tableHead = ["#", "TEAM", "P", "W", "L", "PTS"];

export default function StandingsTable({ standings }: Props) {
  const sortedStandings = [...standings].sort(
    (a, b) =>
      b.points - a.points ||
      b.mw - a.mw ||
      a.ml - b.ml ||
      a.team.name.localeCompare(b.team.name),
  );

  return (
    <table className="w-full min-w-105 text-xs text-agl-white sm:min-w-full sm:text-sm">
      <thead className="text-agl-gray text-[12px]">
        <tr>
          {tableHead.map((detail) => (
            <th key={detail} className="px-2 py-3 text-left sm:px-4">
              {detail}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="border-t border-agl-border-light">
        {sortedStandings.map((standing, index) => (
          <tr
            key={standing.team._id}
            className="cursor-pointer border-b border-agl-border-light text-left transition-colors duration-200 hover:bg-agl-yellow/10 last:[&>td]:border-b-0 last:[&>td:first-child]:rounded-bl-xl last:[&>td:last-child]:rounded-br-xl"
          >
            <td className="px-2 py-3 sm:px-4 sm:py-4">
              <div className="flex h-6 aspect-square items-center justify-center rounded-full bg-agl-yellow font-bold text-black">
                {index + 1}
              </div>
            </td>
            <td className="px-2 sm:px-4">
              <div className="flex min-w-0 items-center gap-1 font-bold">
                {standing.team.logo?.url ? (
                  <div
                    style={{
                      backgroundImage: `url("${standing.team.logo.url}")`,
                    }}
                    className="w-5 shrink-0 aspect-square bg-cover bg-center"
                  />
                ) : (
                  <div className="flex w-5 shrink-0 aspect-square items-center justify-center rounded-full bg-agl-gray/20 text-[10px] text-agl-gray">
                    {standing.team.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="truncate">{standing.team.name}</span>
              </div>
            </td>
            <td className="px-2 py-3 text-agl-gray sm:px-4">{standing.mp}</td>
            <td className="px-2 py-3 text-agl-success sm:px-4">
              {standing.mw}
            </td>
            <td className="px-2 py-3 text-agl-red sm:px-4">{standing.ml}</td>
            <td className="px-2 py-3 text-agl-yellow sm:px-4">
              {standing.points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
