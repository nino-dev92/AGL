import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import type { User } from "../types/types";
import apiAxios from "../api/apiAxios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PlayerCard from "../components/cards/PlayerCard";

export default function Players() {
  const [players, setPlayers] = useState<User[]>([]);
  const [totalplayers, setTotalPlayers] = useState<number>(0);
  const [selected, setSelected] = useState<string>("All");

  const buttons = useMemo(
    () => [
      "All",
      ...new Set(players.map((player) => player.game!.name.toUpperCase())),
    ],
    [players],
  );

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesGame = selected === "All" || selected === player.game.name;

      return matchesGame;
    });
  }, [players, selected]);

  useEffect(() => {
    const getPlayers = async () => {
      try {
        const result = await apiAxios.get("/players");
        setPlayers(result.data.data);
        setTotalPlayers(result.data.pagination.totalPlayers);
      } catch (error) {
        console.log(error);
      }
    };

    getPlayers();
  }, []);

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
              {buttons.map((button) => {
                return (
                  <button
                    key={button}
                    className={`shrink-0 rounded-[9px] text-agl-white border border-agl-border-light px-4 py-2 font-inter font-medium ${selected === button ? "bg-agl-red" : ""} cursor-pointer`}
                    onClick={() => setSelected(button)}
                  >
                    {button}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col justify-center w-full">
              <p className="text-agl-gray text-[12px]">
                {totalplayers} players
              </p>

              {/**Players Card */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredPlayers.length < 1 ? (
                  <p className="text-agl-white text- center">No player found</p>
                ) : (
                  filteredPlayers.map((player) => {
                    return <PlayerCard key={player.id} player={player} />;
                  })
                )}
              </div>
            </div>
          </div>
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
