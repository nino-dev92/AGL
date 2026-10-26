import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { User } from "../types/types";
import apiAxios from "../api/apiAxios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PlayerCard from "../components/cards/PlayerCard";

type PlayerQueryResponse = {
  data: User[];
  pagination: {
    totalPages: number;
    totalPlayers: number;
  };
};

type GameQueryResponse = {
  data: Array<{ _id: string; name: string }>;
};

export default function Players() {
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const gamesQuery = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const result = await apiAxios.get<GameQueryResponse>("/games", {
        params: { limit: 50 },
      });
      return result.data.data;
    },
  });

  const playersQuery = useQuery({
    queryKey: ["players", page, selectedGame],
    queryFn: async () => {
      const result = await apiAxios.get<PlayerQueryResponse>("/players", {
        params: { page, game: selectedGame || undefined },
      });
      return result.data;
    },
  });

  const players = playersQuery.data?.data ?? [];
  const totalPlayers = playersQuery.data?.pagination.totalPlayers ?? 0;
  const totalPages = Math.max(playersQuery.data?.pagination.totalPages ?? 1, 1);

  if (playersQuery.isLoading)
    return <p className="text-white">Loading players...</p>;
  if (playersQuery.isError)
    return <p className="text-white">Error loading players.</p>;

  return (
    <>
      <Header />

      <main className="mx-auto mt-10">
        <section className="border-b border-agl-border-light mb-4">
          {/**Intro text */}
          <div className="flex flex-col py-3 px-6 xl:px-50 mb-10">
            <p className="text-agl-gray font-sans text-[12px] font-bold tracking-[2px]">
              {" "}
              LEADERBOARD
            </p>
            <h1 className="mt-2 text-agl-white text-4xl font-extrabold leading-[1.02] tracking-[-2px] sm:text-5xl lg:text-6xl">
              MEET THE PLAYERS{" "}
              <span className="text-agl-red">DEFINING THE SCENE.</span>
            </h1>
            <p className="text-agl-gray font-sans text-[16px] mt-2 mb-4">
              Every registered AGL player. Filter by game to find who you'll
              face.
            </p>
          </div>
        </section>

        {/**Players section */}
        <section className="border-b border-b-agl-border-light flex flex-col mb-4 pb-10">
          {/**Game Buttons */}
          <div className="py-3 px-6 xl:px-50">
            <div className="mb-6 flex gap-2 overflow-x-auto pt-2 pb-2 sm:mb-7 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {[
                { id: "", name: "All" },
                ...(gamesQuery.data ?? []).map((game) => ({
                  id: game._id,
                  name: game.name,
                })),
              ].map((game) => (
                <button
                  key={game.id || game.name}
                  className={`shrink-0 rounded-[9px] text-agl-white border border-agl-border-light px-4 py-2 font-inter font-medium ${selectedGame === game.id ? "bg-agl-red" : ""} cursor-pointer`}
                  onClick={() => {
                    setSelectedGame(game.id);
                    setPage(1);
                  }}
                >
                  {game.name.toUpperCase()}
                </button>
              ))}
            </div>
            {gamesQuery.isError && (
              <p className="text-red-400" role="alert">
                Game filters could not be loaded.
              </p>
            )}

            <div className="flex flex-col justify-center w-full">
              <p className="text-agl-gray text-[12px]">
                {playersQuery.data?.pagination.totalPlayers} players
              </p>

              {/**Players Card */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {players.length < 1 ? (
                  <p className="text-agl-white text- center">No player found</p>
                ) : (
                  players.map((player) => {
                    return <PlayerCard key={player.id} player={player} />;
                  })
                )}
              </div>
            </div>
          </div>

          {/**Pagination */}
          <section className="flex gap-4 justify-center mt-20">
            <button
              disabled={page === 1}
              className="cursor-pointer hover:underline disabled:cursor-not-allowed disabled:text-agl-gray disabled:hover:no-underline"
              onClick={() => {
                if (page > 1) setPage(page - 1);
              }}
            >
              Prev
            </button>
            <span className="font-semibold text-xl text-white">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              className="cursor-pointer hover:underline disabled:cursor-not-allowed disabled:text-agl-gray disabled:hover:no-underline"
              onClick={() => {
                if (page < totalPages) setPage(page + 1);
              }}
            >
              Next
            </button>
          </section>
        </section>

        <section className="m-20 flex flex-col gap-3">
          <h2 className="text-center text-white text-4xl font-extrabold leading-[1.02] tracking-[-2px] sm:text-5xl lg:text-6xl">
            YOUR NEXT MATCH <span className="text-agl-red">STARTS HERE.</span>
          </h2>
          <p className="text-agl-gray-dark text-center text-[18px]">
            Join thousands of players competing, watching and building
            communities around the games they love.
          </p>

          <div className="flex flex-col md:flex-row gap-2 font-bold justify-center text-white place-items-center mt-4">
            <button className="w-full max-w-64 bg-agl-red hover:bg-red-400 p-3 rounded-xl cursor-pointer transition-all duration-200">
              <Link to="/signup">Create Your Free Account</Link>
            </button>
            <button className="w-full max-w-64 border border-agl-white p-3 hover:bg-agl-white hover:text-agl-black rounded-xl cursor-pointer transition-all duration-200">
              <Link to="/tournaments">Browse Tournaments</Link>
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
