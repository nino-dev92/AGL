import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../hooks/useAuth";
import apiAxios from "../../api/apiAxios";
import type { Team } from "../../types/types";
import Loading from "../../components/Loading";
import GeneralLayout from "../../layouts/GeneralLayout";
import InfoDiv from "../../components/manager-dashboard/info-div/InfoDiv";
import LoggedIn from "../../components/manager-dashboard/Logged-in/LoggedIn";
import PlayerRoster from "../../components/manager-dashboard/player-roster/PlayerRoster";
import ImportantUpdates from "../../components/manager-dashboard/important-updates/ImportantUpdates";
import TeamManagement from "../../components/manager-dashboard/team-management/TeamManagement";
import { GoPeople } from "react-icons/go";
import { FaPeopleGroup } from "react-icons/fa6";

const buttons = [
  { id: 1, info: "Players", icon: <GoPeople size={17} /> },
  { id: 2, info: "Teams", icon: <FaPeopleGroup size={20} /> },
];

export default function ManagerDashboard() {
  const { auth } = useAuth();
  const [selected, setSelected] = useState<string>("Players");

  const teamQuery = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await apiAxios.get<{ data: Team[] }>("/teams", {
        params: {
          limit: 50,
        },
      });
      return res.data.data;
    },
  });

  const allTeams = teamQuery.data;

  const managedTeams = useMemo(() => {
    return (allTeams ?? []).filter((team) => {
      return auth?.id === team.manager;
    });
  }, [allTeams, auth?.id]);

  if (teamQuery.isLoading) {
    return (
      <GeneralLayout>
        <main className="flex min-h-[80vh] items-center justify-center">
          <Loading />
        </main>
      </GeneralLayout>
    );
  }

  return (
    <GeneralLayout>
      <title>Dashboard</title>

      <main className="mt-4 flex w-full min-w-0 flex-col gap-4 px-4 py-3 sm:gap-5 sm:px-6 xl:px-main-x-lg">
        {/**Welcome message */}
        <div className="flex justify-end text-right text-agl-white">
          <p className="max-w-full wrap-break-word">
            Welcome, {auth?.username.toUpperCase()}
          </p>
        </div>

        {/** Intro and buttons */}
        <div className="flex min-w-0 flex-col justify-between gap-3 text-agl-white md:flex-row md:items-end md:gap-4">
          <div className="min-w-0">
            <h2 className="font-bebas-neue text-3xl sm:text-4xl">
              MANAGER COMMAND CENTER
            </h2>
            <p className="text-sm text-agl-gray">
              Monitor player performance. KD ratios and live activity
            </p>
          </div>

          {/**Buttons */}
          <div className="flex h-fit w-full shrink-0 gap-2 rounded-xl border border-agl-border-light bg-agl-background-dark-gray p-0.5 text-sm sm:w-fit">
            {buttons.map((button) => {
              return (
                <button
                  key={button.id}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-xl px-4 py-1.5 sm:flex-none ${selected === button.info ? "bg-agl-red" : "text-agl-gray"} hover:text-agl-white`}
                  onClick={() => setSelected(button.info)}
                >
                  {button.icon}
                  {button.info}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
          {selected === "Players" ? (
            <>
              <InfoDiv teams={managedTeams} />
              <LoggedIn teams={managedTeams} />
              <PlayerRoster teams={managedTeams} />
              <ImportantUpdates />
            </>
          ) : (
            <TeamManagement teams={managedTeams} />
          )}
        </div>
      </main>
    </GeneralLayout>
  );
}
