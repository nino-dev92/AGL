import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import GeneralLayout from "../layouts/GeneralLayout";
import Loading from "../components/Loading";
import PageWrapper from "../utils/PageWrapper";
import IntroDiv from "../components/single-tournament-page/Intro-div/IntroDiv";
import type { Tournament } from "../types/types";

export default function TournamentPage() {
  const { id } = useParams<{ id: string }>();
  const axiosPrivate = useAxiosPrivate();

  const tournamentQuery = useQuery({
    queryKey: ["tournament", id],
    queryFn: async () => {
      const res = await axiosPrivate.get<{ data: Tournament }>(
        `/tournaments/${id}`,
      );

      return res.data;
    },
  });

  const tournament = tournamentQuery.data;
  console.log(tournament);

  if (tournamentQuery.isLoading)
    return (
      <GeneralLayout>
        <div className="min-h-[80vh]">
          <Loading />
        </div>
      </GeneralLayout>
    );

  return (
    <GeneralLayout>
      <PageWrapper>
        <IntroDiv />

        <div className="text-agl-primary h-[80vh] text-center border border-agl-success p-2">
          Tournament Page {id}
        </div>
      </PageWrapper>
    </GeneralLayout>
  );
}
