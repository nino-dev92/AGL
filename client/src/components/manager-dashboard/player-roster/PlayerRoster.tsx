import { useMemo, useState } from "react";
import type { Team } from "../../../types/types";
import PlayersTable from "./PlayersTable";
import { IoSearch } from "react-icons/io5";

type Props = {
  teams: Team[];
};

const buttons: string[] = ["All", "Online", "Offline"];

export default function PlayerRoster({ teams }: Props) {
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  const players = teams.flatMap((team) => team.members) ?? [];

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = player.userName.includes(searchTerm);

      return matchesSearch;
    });
  }, [players, search]);

  return (
    <div className="bg-agl-background-light text-agl-white border border-agl-border-light rounded-2xl">
      <section className="p-4 flex flex-col sm:flex-row justify-between items-center border-b border-agl-border-light">
        <div>
          <h2 className="text-[24px] font-bebas-neue">PLAYER ROSTER</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/**Search bar */}
          <div className="flex relative">
            <IoSearch
              size={17}
              className="absolute top-3 left-2 text-agl-gray cursor-pointer"
            />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              className="py-2 px-8 border border-agl-border-light rounded-xl focus:border-agl-red focus:outline-none"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/**Buttons */}
          <div className="flex items-center justify-center gap-2 px-2 h-10 font-bold text-[13px] bg-agl-black-light border border-agl-border-light rounded-2xl">
            {buttons.map((button) => {
              return (
                <button
                  key={button}
                  className={`${filter === button ? "bg-agl-red text-agl-white" : " text-agl-gray-light hover:text-agl-white"} px-2 py-1 h-fit w-fit  cursor-pointer rounded`}
                  onClick={() => setFilter(button)}
                >
                  {button}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/**Players Table */}
      <section className="min-h-16">
        {filteredPlayers.length < 1 ? (
          <h3 className="text-agl-white text-center mt-4">
            No players matched your search
          </h3>
        ) : (
          <PlayersTable team={filteredPlayers} />
        )}
      </section>
    </div>
  );
}
