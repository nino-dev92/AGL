import { useParams } from "react-router-dom";
import GeneralLayout from "../layouts/GeneralLayout";
import PageWrapper from "../utils/PageWrapper";

export default function TournamentPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <GeneralLayout>
      <PageWrapper>
        <div className="text-agl-primary h-[80vh] text-center border border-agl-success p-2">
          Tournament Page {id}
        </div>
      </PageWrapper>
    </GeneralLayout>
  );
}
