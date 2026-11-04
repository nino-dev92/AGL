import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import type { Team } from "../../../types/types";

type TournamentRegistration = {
  createdAt: string;
  manager: string;
  status: string;
  team: {
    _id: string;
    name: string;
    game: string;
  };
  tournament: {
    _id: string;
    name: string;
    slug: string;
    status: string;
  };
  updatedAt: string;
  __v: 0;
  _id: string;
};

type Props = {
  team: Team;
};

export default function TournamentRegistrationCard({ team }: Props) {
  const axiosPrivate = useAxiosPrivate();

  const registrationQuery = useQuery({
    queryKey: ["tournament-registrations", "my-applications"],
    queryFn: async () => {
      const res = await axiosPrivate.get<{ data: TournamentRegistration[] }>(
        "/tournament-registrations/my-applications",
      );

      return res.data.data;
    },
  });

  const registrations = registrationQuery.data ?? [];

  const filteredRegistrations = registrations.filter(
    (item) => item.team._id === team._id,
  );

  return (
    <div className="flex flex-col gap-2">
      {registrationQuery.isPending ? (
        <p className="text-center text-agl-gray">Loading registrations...</p>
      ) : registrationQuery.isError ? (
        <p className="text-center text-agl-gray">
          Could not load tournament registrations.
        </p>
      ) : filteredRegistrations.length > 0 ? (
        filteredRegistrations.map((registration) => (
          <div
            key={registration._id}
            className="flex items-center justify-between rounded-lg border border-agl-border-light bg-agl-background-dark-gray p-2 text-agl-white"
          >
            <div>
              <h3 className="text-[14px] sm:text-[15px] font-bold">
                {registration.tournament.name.toUpperCase()}
              </h3>
              <p className="text-[10px] text-agl-gray sm:text-[12px]">
                Registered{" "}
                {new Date(registration.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`${registration.status === "approved" ? "bg-agl-success" : registration.status === "pending" ? "bg-agl-yellow text-agl-black" : "bg-agl-red"} rounded-2xl border font-bold border-agl-border-light px-3 py-1 text-[12px] capitalize`}
            >
              {registration.status}
            </span>
          </div>
        ))
      ) : (
        <h3 className="text-center text-agl-gray">
          Not registered for any tournaments.
        </h3>
      )}
    </div>
  );
}
