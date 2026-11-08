import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { Tournament, TournamentStanding } from "../types/types";
import apiAxios from "../api/apiAxios";
import InfoCard from "../components/match-schedule/InfoCards";
import GeneralLayout from "../layouts/GeneralLayout";
import PageWrapper from "../utils/PageWrapper";
import IntroDiv from "../components/tournament-standings/IntroDiv";
import CurrentLeaderCard from "../components/tournament-standings/CurrentLeaderCard";
import StandingsCard from "../components/tournament-standings/StandingsCard";
import { FaArrowLeft } from "react-icons/fa";
import Loading from "../components/Loading";

export default function TournamentStandingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const tournamentQuery = useQuery({
    queryKey: ["tournament", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await apiAxios.get<{ data: Tournament }>(
        `/tournaments/${id}`,
      );
      return response.data.data;
    },
  });
  const standingsQuery = useQuery({
    queryKey: ["standings", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await apiAxios.get<{ data: TournamentStanding[] }>(
        `/standings/${id}`,
      );
      return response.data.data;
    },
  });

  if (!id) {
    return (
      <GeneralLayout>
        <PageWrapper>
          <p className="py-12 text-center text-agl-white">
            Tournament not found.
          </p>
        </PageWrapper>
      </GeneralLayout>
    );
  }

  if (tournamentQuery.isLoading || standingsQuery.isLoading) {
    return (
      <GeneralLayout>
        <PageWrapper>
          <div className="min-h-[60vh]">
            <Loading />
          </div>
        </PageWrapper>
      </GeneralLayout>
    );
  }

  if (
    tournamentQuery.isError ||
    standingsQuery.isError ||
    !tournamentQuery.data ||
    !standingsQuery.data
  ) {
    return (
      <GeneralLayout>
        <PageWrapper>
          <div className="py-12 text-center text-agl-white">
            <p>Could not load this tournament.</p>
            <button
              type="button"
              className="mt-3 rounded-lg bg-agl-red px-4 py-2 hover:bg-red-500"
              onClick={() => void tournamentQuery.refetch()}
            >
              Try again
            </button>
          </div>
        </PageWrapper>
      </GeneralLayout>
    );
  }

  const tournament = tournamentQuery.data;
  const standings = standingsQuery.data;
  const currentLeader = standings.find((standing) => standing.mp > 0) ?? null;
  const info = [
    {
      id: 1,
      label: "TEAMS",
      detail: tournament.registeredTeams.length,
      color: "agl-white",
    },
    {
      id: 2,
      label: "MAX TEAMS",
      detail: tournament.maxTeams,
      color: "agl-success",
    },
    {
      id: 3,
      label: "PRIZE POOL",
      detail: tournament.prizePool,
      color: "agl-yellow",
    },
  ];

  return (
    <GeneralLayout>
      <PageWrapper>
        <div className="flex flex-col gap-6 text-agl-primary mb-8 px-4 py-3 sm:px-6 xl:px-main-x-lg">
          <IntroDiv tournament={tournament} />

          {/**Info Cards */}
          <section className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {info.map((item) => (
              <InfoCard key={item.id} info={item} />
            ))}
          </section>

          <CurrentLeaderCard standing={currentLeader} />

          <section className="flex flex-col gap-2">
            {standings.length > 0 ? (
              standings.map((standing, index) => (
                <StandingsCard
                  key={standing.team._id}
                  standing={standing}
                  rank={index + 1}
                />
              ))
            ) : (
              <p className="py-8 text-center text-agl-gray">
                No team standings available yet.
              </p>
            )}
          </section>

          {/**Button */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="p-2 text-[14px] flex gap-1 items-center text-agl-yellow border border-agl-yellow hover:bg-agl-yellow/10 duration-200 rounded-xl cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft /> Back to Tournament
            </button>
          </div>
        </div>
      </PageWrapper>
    </GeneralLayout>
  );
}
