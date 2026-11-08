import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiAxios from "../api/apiAxios";
import type { Tournament, Match } from "../types/types";
import GeneralLayout from "../layouts/GeneralLayout";
import Intro from "../components/match-schedule/Intro";
import InfoCard from "../components/match-schedule/InfoCards";
import MatchToggle from "../components/match-schedule/MatchToggle";
import MatchCard from "../components/match-schedule/cards/MatchCard";
import { FaArrowLeft } from "react-icons/fa6";
import Loading from "../components/Loading";

export default function MatchSchedule() {
  const { id } = useParams<string>();
  const [view, setView] = useState<string>("All Matches");
  const navigate = useNavigate();

  const tournamnetQuery = useQuery({
    queryKey: ["tournament", id],
    queryFn: async () => {
      const res = await apiAxios.get<{ data: Tournament }>(
        `/tournaments/${id}`,
      );

      return res.data.data;
    },
  });

  const matchQuery = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const res = await apiAxios.get<{ data: Match[] }>("/match");
      return res.data.data;
    },
  });

  const tournament = tournamnetQuery.data;
  const matches =
    matchQuery.data?.filter(
      (match) => match.tournament._id === tournament?._id,
    ) ?? [];

  const matchFilters = {
    liveMatches: matches.filter((match) => match.status === "ongoing"),
    upComingMatches: matches.filter((match) => match.status === "upcoming"),
    completedMatches: matches.filter((match) => match.status === "completed"),
  };

  const info = [
    {
      detail: matchFilters.liveMatches.length,
      label: "LIVE",
      color: "agl-red",
    },
    {
      detail: matchFilters.upComingMatches.length,
      label: "UPCOMING",
      color: "agl-yellow",
    },
    {
      detail: matchFilters.completedMatches.length,
      label: "COMPLETED",
      color: "agl-gray",
    },
  ];

  if (tournamnetQuery.isLoading)
    return (
      <div className="min-h[80vh]">
        <Loading />
      </div>
    );

  return (
    <GeneralLayout>
      <div className="min-h-[80vh] flex flex-col mb-8 px-4 py-3 sm:px-6 xl:px-main-x-lg text-agl-white">
        {tournamnetQuery.isError && (
          <div>
            {" "}
            <h2 className="text-agl-white text-center">
              Tournament could not be loaded
            </h2>
            <button type="button" onClick={() => navigate(-1)}>
              Go back
            </button>
          </div>
        )}

        {!tournamnetQuery.isError && tournament && (
          <>
            <Intro tournament={tournament} />

            {/**Info cards section */}
            <section className="grid grid-cols-3 gap-1 sm:gap-2 mt-6">
              {info.map((info, index) => (
                <InfoCard key={index} info={info} />
              ))}
            </section>

            {/**Toggle */}
            <section className="mt-6">
              <MatchToggle
                matches={{
                  allMatches: matches.length,
                  liveMatches: matchFilters.liveMatches.length,
                  upComingMatches: matchFilters.upComingMatches.length,
                  completedMatches: matchFilters.completedMatches.length,
                }}
                view={view}
                setView={setView}
              />
            </section>

            {/**Match Cards */}
            <section className="mt-4">
              {view === "All Matches" && <MatchCard matches={matches} />}
              {view === "Live" && (
                <MatchCard matches={matchFilters.liveMatches} />
              )}
              {view === "Upcoming" && (
                <MatchCard matches={matchFilters.upComingMatches} />
              )}
            </section>

            {/**Go back Button */}
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                className="p-2 text-[14px] flex gap-1 items-center text-agl-yellow border border-agl-yellow hover:bg-agl-yellow/10 duration-200 rounded-xl cursor-pointer"
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft /> Back to Tournament
              </button>
            </div>
          </>
        )}
      </div>
    </GeneralLayout>
  );
}
