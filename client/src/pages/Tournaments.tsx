import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Tournament } from "../types/types";
import apiAxios from "../api/apiAxios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TournamentCard from "../components/cards/TournamentCard";

interface TournamentQueryResponse {
  data: Tournament[];
  pagination: {
    totalPages: number;
  };
}

export default function Tournaments() {
  const [selected, setSelected] = useState<string>("All");
  const [region, setRegion] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const tournamentQuery = useQuery({
    queryKey: ["tournaments", { search, region, status, page }],
    queryFn: async () => {
      const res = await apiAxios.get<TournamentQueryResponse>("/tournaments", {
        params: {
          search: search.trim(),
          region,
          status,
          page,
        },
      });
      return res.data;
    },
  });

  const tournaments = tournamentQuery.data?.data ?? [];
  const totalPages = Math.max(
    tournamentQuery.data?.pagination.totalPages ?? 1,
    1,
  );

  const buttons = useMemo(
    () => [
      "All",
      ...new Set(
        tournaments.map((tournament) => tournament.game.name.toUpperCase()),
      ),
    ],
    [tournaments],
  );

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((tournament) => {
      const gameName = tournament.game.name.toLowerCase();
      const matchesGame =
        selected === "All" || gameName.includes(selected.toLowerCase());

      return matchesGame;
    });
  }, [tournaments, selected]);

  if (tournamentQuery.isError)
    return <h2 className="text-white">Error loading</h2>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="text-white grow">
        {/** First section */}
        <section className="border-b border-agl-border-light px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-18">
          <div className="mx-auto w-full max-w-7xl px-2 sm:px-4">
            <p className="text-agl-gray-dark text-[14px] font-800 mb-2.5 tracking-[4px] font-extrabold">
              EXPLORE TOURNAMENTS
            </p>
            <h1 className="mb-4 text-4xl font-extrabold leading-[1.02] tracking-[-2px] sm:text-5xl lg:text-6xl">
              FIND YOUR <span className="text-agl-red">NEXT</span>{" "}
              <span className="text-agl-yellow">BATTLE.</span>
            </h1>
            <p className="max-w-150 text-base text-agl-gray-dark sm:text-lg">
              Browse every AGL tournament across our featured games. Anyone can
              look; create a free account to join.
            </p>
          </div>
        </section>

        {/**Tournaments Section */}
        <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-18">
          {tournamentQuery.isLoading && (
            <p className="text-white text-center">Loading tournaments...</p>
          )}

          {!tournamentQuery.isLoading && (
            <div className="mx-auto w-full max-w-7xl">
              {/**Buttons Div */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2 sm:mb-7 sm:flex-wrap sm:overflow-visible sm:pb-0">
                {buttons.map((button) => {
                  return (
                    <button
                      key={button}
                      className={`shrink-0 rounded-[9px] border border-agl-border-light px-4 py-2 font-inter font-medium ${selected === button ? "bg-agl-red" : ""} cursor-pointer`}
                      onClick={() => setSelected(button)}
                    >
                      {button}
                    </button>
                  );
                })}
              </div>

              {/**Search */}
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    placeholder="Search Tournament..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded border border-agl-border-light bg-agl-white p-2 text-agl-black"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:flex">
                  {/**Status Filter */}
                  <select
                    className="min-w-0 cursor-pointer rounded border border-agl-border-light bg-agl-white p-2 text-agl-black sm:min-w-35"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">Any Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="registration-open">Registration open</option>
                    <option value="registration-closed">
                      Registration closed
                    </option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {/**Regions Filter */}
                  <select
                    className="min-w-0 cursor-pointer rounded border border-agl-border-light bg-agl-white p-2 text-agl-black sm:min-w-35"
                    value={region}
                    onChange={(e) => {
                      setRegion(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All Regions</option>
                    <option value="Africa">Africa</option>
                    <option value="Canada">Canada</option>
                    <option value="Europe">Europe</option>
                    <option value="USA">USA</option>
                  </select>
                </div>
              </div>
              {/**Tournaments Cards */}
              <div className="mt-6 grid auto-rows-fr grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3">
                {filteredTournaments.length < 1 ? (
                  <h2 className="text-center text-lg">No tournament found</h2>
                ) : (
                  filteredTournaments.map((tournament) => (
                    <div key={tournament.id}>
                      <TournamentCard tournament={tournament} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/**Pagination */}
        <section className="flex gap-4 justify-center mt-20 mb-5">
          <button
            disabled={page === 1}
            className="cursor-pointer hover:underline disabled:cursor-not-allowed disabled:text-agl-gray disabled:hover:no-underline"
            onClick={() => {
              if (page > 1) setPage(page - 1);
            }}
          >
            Prev
          </button>
          <span className="font-semibold text-xl">
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
      </main>

      <Footer />
    </div>
  );
}
