import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Tournament, Match, TournamentStanding } from "../types/types";
import apiAxios from "../api/apiAxios";
import GeneralLayout from "../layouts/GeneralLayout";
import Loading from "../components/Loading";
import PageWrapper from "../utils/PageWrapper";
import IntroDiv from "../components/single-tournament-page/Intro-div/IntroDiv";
import CardSection from "../components/single-tournament-page/card-section/CardSection";
import Toggle from "../components/single-tournament-page/toggle/Toggle";
import Overview from "../components/single-tournament-page/overview/Overview";
import Rules from "../components/single-tournament-page/rules-page/Rules";
import Standings from "../components/single-tournament-page/standings/Standings";

export default function TournamentPage() {
  const { id } = useParams<{ id: string }>();
  const [view, setView] = useState("Overview");

  const tournamentQuery = useQuery({
    queryKey: ["tournament", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await apiAxios.get<{ data: Tournament }>(
        `/tournaments/${id}`,
      );

      return res.data.data;
    },
  });

  const matchQuery = useQuery({
    queryKey: ["match"],
    queryFn: async () => {
      const res = await apiAxios.get<{ data: Match[] }>("/match");

      return res.data.data;
    },
  });

  const standingsQuery = useQuery({
    queryKey: ["standings", id],
    queryFn: async () => {
      const res = await apiAxios.get<{ data: TournamentStanding[] }>(
        `/standings/${id}`,
      );

      return res.data.data;
    },
  });

  const tournament = tournamentQuery.data;
  const matches = matchQuery.data;
  const tournamentStandings = standingsQuery.data ?? [];

  const filteredMatches = useMemo(() => {
    return matches?.filter((match) => match.tournament._id === tournament?._id);
  }, [matches]);

  if (!id) {
    return (
      <GeneralLayout>
        <PageWrapper>
          <div className="min-h-[80vh]">
            <p className="py-12 text-center text-agl-white">
              Tournament not found.
            </p>
          </div>
        </PageWrapper>
      </GeneralLayout>
    );
  }

  if (tournamentQuery.isLoading)
    return (
      <GeneralLayout>
        <div className="min-h-[80vh]">
          <Loading />
        </div>
      </GeneralLayout>
    );

  if (tournamentQuery.isError) {
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

  if (!tournament) {
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

  return (
    <GeneralLayout>
      <PageWrapper>
        <IntroDiv tournament={tournament} />

        <div className="flex flex-col gap-6 text-agl-primary mb-8 px-4 py-3 sm:px-6 xl:px-main-x-lg">
          <CardSection
            tournament={tournament}
            matches={filteredMatches ?? []}
          />

          <Toggle setView={setView} />

          {view === "Overview" && (
            <Overview tournament={tournament} matches={filteredMatches ?? []} />
          )}

          {view === "Rules" && <Rules tournament={tournament} />}

          {view === "Standings" && (
            <Standings standings={tournamentStandings} tournamentId={id} />
          )}
        </div>
      </PageWrapper>
    </GeneralLayout>
  );
}
